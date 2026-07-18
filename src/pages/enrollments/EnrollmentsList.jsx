import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

import { enrollmentService } from "../../services/enrollmentService";
import { studentService } from "../../services/studentService";
import { classService } from "../../services/classService";
import { extractErrorMessage } from "../../utils/errorMessage";
import "../students/StudentsList.css";

const STATUS_OPTIONS = [
  { label: "Ativa", value: "active" },
  { label: "Trancada", value: "locked" },
  { label: "Encerrada", value: "closed" },
];

// O backend (enrollmentController) usa snake_case no corpo/registro:
// { id, student_id, class_id, status }.
// POST /enrollments  -> aceita apenas { student_id, class_id }
// PUT  /enrollments/:id -> aceita apenas { status } (rota updateStatus)
export default function EnrollmentsList() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ studentId: null, classId: null, status: "active" });
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [enrollmentsData, studentsData, classesData] = await Promise.all([
        enrollmentService.list(),
        studentService.list(),
        classService.list(),
      ]);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar matrículas",
        detail: extractErrorMessage(err),
        life: 6000,
      });
    } finally {
      setLoading(false);
    }
  }

  function studentName(id) {
    return students.find((s) => s.id === id)?.name || "—";
  }

  function className(id) {
    return classes.find((c) => c.id === id)?.name || "—";
  }

  function openCreate() {
    setEditing(null);
    setForm({ studentId: null, classId: null, status: "active" });
    setDialogVisible(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ studentId: row.student_id, classId: row.class_id, status: row.status });
    setDialogVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        // A rota de edição só atualiza status (updateStatus no controller)
        await enrollmentService.update(editing.id, { status: form.status });
        toast.current?.show({ severity: "success", summary: "Matrícula atualizada" });
      } else {
        // O backend exige exatamente student_id e class_id
        await enrollmentService.create({
          student_id: form.studentId,
          class_id: form.classId,
        });
        toast.current?.show({ severity: "success", summary: "Matrícula criada" });
      }
      setDialogVisible(false);
      load();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao salvar matrícula",
        detail: extractErrorMessage(err),
        life: 8000,
      });
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(row) {
    confirmDialog({
      message: "Remover esta matrícula?",
      header: "Confirmar remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await enrollmentService.remove(row.id);
          toast.current?.show({ severity: "success", summary: "Matrícula removida" });
          load();
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Erro ao remover",
            detail: extractErrorMessage(err),
            life: 6000,
          });
        }
      },
    });
  }

  const statusSeverity = { active: "success", locked: "warning", closed: "danger" };

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
          <p className="eo-eyebrow">Gestão</p>
          <h1>Matrículas</h1>
        </div>
        <Button label="Nova matrícula" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <div className="eo-card eo-table-card">
        <DataTable
          value={enrollments}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhuma matrícula cadastrada."
          stripedRows
        >
          <Column header="Aluno" body={(r) => studentName(r.student_id)} />
          <Column header="Turma" body={(r) => className(r.class_id)} />
          <Column
            header="Status"
            body={(r) => (
              <Tag
                value={STATUS_OPTIONS.find((s) => s.value === r.status)?.label || r.status}
                severity={statusSeverity[r.status] || "info"}
              />
            )}
          />
          <Column header="Ações" body={actionBody} style={{ width: "7rem" }} />
        </DataTable>
      </div>

      <Dialog
        header={editing ? "Editar matrícula" : "Nova matrícula"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "26rem" }}
        modal
      >
        <div className="eo-form">
          {!editing && (
            <>
              <label className="eo-field">
                <span>Aluno</span>
                <Dropdown
                  value={form.studentId}
                  options={students.map((s) => ({ label: s.name, value: s.id }))}
                  onChange={(e) => setForm({ ...form, studentId: e.value })}
                  placeholder="Selecione o aluno"
                  filter
                />
              </label>
              <label className="eo-field">
                <span>Turma</span>
                <Dropdown
                  value={form.classId}
                  options={classes.map((c) => ({ label: c.name, value: c.id }))}
                  onChange={(e) => setForm({ ...form, classId: e.value })}
                  placeholder="Selecione a turma"
                  filter
                />
              </label>
            </>
          )}

          {editing && (
            <>
              <p className="eo-form-hint">
                {studentName(form.studentId)} · {className(form.classId)}
              </p>
              <label className="eo-field">
                <span>Status</span>
                <Dropdown
                  value={form.status}
                  options={STATUS_OPTIONS}
                  onChange={(e) => setForm({ ...form, status: e.value })}
                />
              </label>
            </>
          )}

          <div className="eo-form-actions">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button
              label={saving ? "Salvando..." : "Salvar"}
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
              disabled={editing ? !form.status : !form.studentId || !form.classId}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
