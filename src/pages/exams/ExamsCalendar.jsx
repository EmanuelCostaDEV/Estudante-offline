import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { examService } from "../../services/examService";
import { classService } from "../../services/classService";
import "../students/StudentsList.css";
import { extractErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = { classId: null, subject: "", date: null };

export default function ExamsCalendar() {
  const [exams, setExams] = useState([]);
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

    // Carrega turmas e provas separadamente: se uma falhar (ex: rota /exams
    // ainda não existe no backend), a outra continua funcionando normalmente.
    const [examsResult, classesResult] = await Promise.allSettled([
      examService.list(),
      classService.list(),
    ]);

    if (examsResult.status === "fulfilled") {
      setExams(examsResult.value);
    } else {
      setExams([]);
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar provas",
        detail: extractErrorMessage(examsResult.reason),
        life: 6000,
      });
    }

    if (classesResult.status === "fulfilled") {
      setClasses(classesResult.value);
    } else {
      setClasses([]);
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar turmas",
        detail: extractErrorMessage(classesResult.reason),
        life: 6000,
      });
    }

    setLoading(false);
  }

  function className(id) {
    return classes.find((c) => c.id === id)?.name || "—";
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogVisible(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      classId: row.classId,
      subject: row.subject || "",
      date: row.date ? new Date(row.date) : null,
    });
    setDialogVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        classId: form.classId,
        subject: form.subject,
        date: form.date?.toISOString(),
      };
      if (editing) {
        await examService.update(editing.id, payload);
        toast.current?.show({ severity: "success", summary: "Prova atualizada" });
      } else {
        await examService.create(payload);
        toast.current?.show({ severity: "success", summary: "Prova agendada" });
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
      message: "Remover esta prova agendada?",
      header: "Confirmar remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await examService.remove(row.id);
          toast.current?.show({ severity: "success", summary: "Prova removida" });
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
          <p className="eo-eyebrow">Calendário</p>
          <h1>Agendamento de provas</h1>
        </div>
        <Button label="Agendar prova" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <div className="eo-card eo-table-card">
        <DataTable
          value={exams}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhuma prova agendada."
          stripedRows
          sortField="date"
          sortOrder={1}
        >
          <Column header="Turma" body={(r) => className(r.classId)} />
          <Column field="subject" header="Disciplina" sortable />
          <Column
            header="Data"
            body={(r) => (r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "—")}
            sortable
            sortField="date"
          />
          <Column header="Ações" body={actionBody} style={{ width: "7rem" }} />
        </DataTable>
      </div>

      <Dialog
        header={editing ? "Editar prova" : "Agendar prova"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "26rem" }}
        modal
      >
        <div className="eo-form">
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
          <label className="eo-field">
            <span>Disciplina</span>
            <InputText
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Matemática"
            />
          </label>
          <label className="eo-field">
            <span>Data da prova</span>
            <Calendar
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.value })}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </label>
          <div className="eo-form-actions">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button
              label={saving ? "Salvando..." : "Salvar"}
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
              disabled={!form.classId || !form.subject || !form.date}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
