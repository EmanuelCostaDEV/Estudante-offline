import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";

import { useAuth } from "../../contexts/AuthContext.jsx";
import { enrollmentService } from "../../services/enrollmentService";
import { examService } from "../../services/examService";
import { gradeService } from "../../services/gradeService";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classesData, setClassesData] = useState([]);

  useEffect(() => {
    if (user?.id) loadData(user.id);
  }, [user]);

  async function loadData(studentId) {
    setLoading(true);
    try {
      const enrollments = await enrollmentService.byStudent(studentId);

      const enriched = await Promise.all(
        enrollments.map(async (enrollment) => {
          const [examsResult, gradesResult] = await Promise.allSettled([
            examService.byClass(enrollment.class_id),
            gradeService.byEnrollment(enrollment.id),
          ]);
          return {
            enrollment,
            exams: examsResult.status === "fulfilled" ? examsResult.value : [],
            grades: gradesResult.status === "fulfilled" ? gradesResult.value : [],
          };
        })
      );

      setClassesData(enriched);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="eo-page eo-student-loading">
        <ProgressSpinner strokeWidth="3" />
      </div>
    );
  }

  return (
    <div className="eo-page">
      <div className="eo-page-header">
        <div>
          <p className="eo-eyebrow">Meu painel</p>
          <h1>Olá, {user?.name?.split(" ")[0]}</h1>
        </div>
      </div>

      {classesData.length === 0 && (
        <div className="eo-card eo-empty-state">
          <p>Você ainda não está matriculado em nenhuma turma.</p>
        </div>
      )}

      <Accordion multiple activeIndex={classesData.map((_, i) => i)}>
        {classesData.map(({ enrollment, exams, grades }) => (
          <AccordionTab
            key={enrollment.id}
            header={enrollment.className || `Turma #${enrollment.class_id}`}
          >
            <div className="eo-student-class-grid">
              <div>
                <h3 className="eo-block-title">Provas agendadas</h3>
                {exams.length === 0 ? (
                  <p className="eo-muted">Nenhuma prova agendada para esta turma.</p>
                ) : (
                  <ul className="eo-simple-list">
                    {exams.map((exam) => (
                      <li key={exam.id}>
                        <span>{exam.subject}</span>
                        <Tag
                          value={new Date(exam.date).toLocaleDateString("pt-BR")}
                          severity="info"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="eo-block-title">Notas</h3>
                {grades.length === 0 ? (
                  <p className="eo-muted">Nenhuma nota lançada ainda.</p>
                ) : (
                  <ul className="eo-simple-list">
                    {grades.map((grade) => (
                      <li key={grade.id}>
                        <span>{grade.term}</span>
                        <span className="eo-numeric eo-grade-value">
                          {Number(grade.value).toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
}
