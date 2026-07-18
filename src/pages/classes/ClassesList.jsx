import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { classService } from "../../services/classService";
import "../students/StudentsList.css";
import { extractErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = { name: "", shift: "", year: "" };

export default function ClassesList() {
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
      setClasses(await classService.list());
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar turmas",
        detail: extractErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogVisible(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ name: row.name, shift: row.shift || "", year: row.year || "" });
    setDialogVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await classService.update(editing.id, form);
        toast.current?.show({ severity: "success", summary: "Turma atualizada" });
      } else {
        await classService.create(form);
        toast.current?.show({ severity: "success", summary: "Turma criada" });
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
      message: `Remover a turma ${row.name}?`,
      header: "Confirmar remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await classService.remove(row.id);
          toast.current?.show({ severity: "success", summary: "Turma removida" });
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
          <p className="eo-eyebrow">Gestão</p>
          <h1>Turmas</h1>
        </div>
        <Button label="Nova turma" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <div className="eo-card eo-table-card">
        <DataTable
          value={classes}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="Nenhuma turma cadastrada."
          stripedRows
        >
          <Column field="name" header="Turma" sortable />
          <Column field="shift" header="Turno" sortable />
          <Column field="year" header="Ano letivo" sortable />
          <Column header="Ações" body={actionBody} style={{ width: "7rem" }} />
        </DataTable>
      </div>

      <Dialog
        header={editing ? "Editar turma" : "Nova turma"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "26rem" }}
        modal
      >
        <div className="eo-form">
          <label className="eo-field">
            <span>Nome da turma</span>
            <InputText
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="eo-field">
            <span>Turno</span>
            <InputText
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
              placeholder="Manhã, tarde ou noite"
            />
          </label>
          <label className="eo-field">
            <span>Ano letivo</span>
            <InputText
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="2026"
            />
          </label>
          <div className="eo-form-actions">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button
              label={saving ? "Salvando..." : "Salvar"}
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
              disabled={!form.name}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
