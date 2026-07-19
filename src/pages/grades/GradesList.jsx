import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { gradeService } from "../../services/gradeService";
import { enrollmentService } from "../../services/enrollmentService";
import { studentService } from "../../services/studentService";
import { classService } from "../../services/classService";
import "../students/StudentsList.css";
import { extractErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = { enrollmentId: null, value: null, term: "" };

export default function GradesList() {
  const [grades, setGrades] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [gradesData, enrollmentsData, studentsData, classesData] = await Promise.all([
        gradeService.list(),
        enrollmentService.list(),
        studentService.list(),
        classService.list(),
      ]);
      setGrades(gradesData);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar notas",
        detail: extractErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }

  function enrollmentLabel(enrollment) {
    const student = students.find((s) => s.id === enrollment.student_id)?.name || "—";
    const klass = classes.find((c) => c.id === enrollment.class_id)?.name || "—";
    return `${student} · ${klass}`;
  }

  function labelForEnrollmentId(id) {
    const enrollment = enrollments.find((e) => e.id === id);
    return enrollment ? enrollmentLabel(enrollment) : "—";
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogVisible(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ enrollmentId: row.enrollmentId, value: row.value, term: row.term || "" });
    setDialogVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await gradeService.update(editing.id, form);
        toast.current?.show({ severity: "success", summary: "Nota atualizada" });
      } else {
        await gradeService.create(form);
        toast.current?.show({ severity: "success", summary: "Nota lançada" });
      }
      setDialogVisible(false);
      load();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao salvar",
        detail: extractErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(row) {
    confirmDialog({
      message: "Remover este lançamento de nota?",
      header: "Confirmar remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await gradeService.remove(row.id);
          toast.current?.show({ severity: "success", summary: "Nota removida" });
          load();
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erro ao remover",
            detail: extractErrorMessage(err),
          });
        }
      },
    });
  }

  const actionBody = (row) => (
    <div className="eo-row-actions">
      <Button icon="pi pi-pencil" text rounded onClick={() => openEdit(row)} />
      <Button
        icon="pi pi-trash"
        text
        rounded
        severity="danger"
        onClick={() => confirmRemove(row)}
      />
    </div>
  );

  return (
    <div className="eo-page">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="eo-page-header">
        <div>
          <p className="eo-eyebrow">Avaliação</p>
          <h1>Notas</h1>
        </div>
        <Button label="Lançar nota" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <div className="eo-card eo-table-card">
        <DataTable
          value={grades}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhuma nota lançada."
          stripedRows
        >
          <Column header="Aluno · Turma" body={(r) => labelForEnrollmentId(r.enrollmentId)} />
          <Column field="term" header="Período" sortable />
          <Column
            header="Nota"
            body={(r) => <span className="eo-numeric">{Number(r.value).toFixed(1)}</span>}
            sortable
            sortField="value"
          />
          <Column header="Ações" body={actionBody} style={{ width: "7rem" }} />
        </DataTable>
      </div>

      <Dialog
        header={editing ? "Editar nota" : "Lançar nota"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "26rem" }}
        modal
      >
        <div className="eo-form">
          <label className="eo-field">
            <span>Matrícula (aluno · turma)</span>
            <Dropdown
              value={form.enrollmentId}
              options={enrollments.map((e) => ({ label: enrollmentLabel(e), value: e.id }))}
              onChange={(e) => setForm({ ...form, enrollmentId: e.value })}
              placeholder="Selecione a matrícula"
              filter
            />
          </label>
          <label className="eo-field">
            <span>Período/bimestre</span>
            <InputText
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              placeholder="1º bimestre"
            />
          </label>
          <label className="eo-field">
            <span>Nota (0 a 10)</span>
            <InputNumber
              value={form.value}
              onValueChange={(e) => setForm({ ...form, value: e.value })}
              minFractionDigits={1}
              maxFractionDigits={1}
              min={0}
              max={10}
            />
          </label>
          <div className="eo-form-actions">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button
              label={saving ? "Salvando..." : "Salvar"}
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
              disabled={!form.enrollmentId || form.value === null || form.value === undefined}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
