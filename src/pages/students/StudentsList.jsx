import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

import { studentService } from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./StudentsList.css";
import { extractErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = { name: "", email: "", password: "" };

export default function StudentsList() {
  const { role } = useAuth();
  const canManage = role === "admin";
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const toast = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const data = await studentService.list();
      setStudents(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao carregar alunos",
        detail: extractErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingStudent(null);
    setForm(EMPTY_FORM);
    setDialogVisible(true);
  }

  function openEditDialog(student) {
    setEditingStudent(student);
    setForm({ name: student.name, email: student.email, password: "" });
    setDialogVisible(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingStudent) {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await studentService.update(editingStudent.id, payload);
        toast.current?.show({
          severity: "success",
          summary: "Aluno atualizado",
          detail: `${form.name} foi atualizado com sucesso.`,
        });
      } else {
        await studentService.create(form);
        toast.current?.show({
          severity: "success",
          summary: "Aluno cadastrado",
          detail: `${form.name} já pode acessar o sistema.`,
        });
      }
      setDialogVisible(false);
      loadStudents();
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

  function confirmDelete(student) {
    confirmDialog({
      message: `Remover o aluno ${student.name}? Esta ação não pode ser desfeita.`,
      header: "Confirmar remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(student),
    });
  }

  async function handleDelete(student) {
    try {
      await studentService.remove(student.id);
      toast.current?.show({
        severity: "success",
        summary: "Aluno removido",
        detail: `${student.name} foi removido.`,
      });
      loadStudents();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao remover",
        detail: extractErrorMessage(err),
      });
    }
  }

  const actionBody = (student) => {
    if (!canManage) return null;
    return (
      <div className="eo-row-actions">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          aria-label="Editar aluno"
          onClick={() => openEditDialog(student)}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          aria-label="Remover aluno"
          onClick={() => confirmDelete(student)}
        />
      </div>
    );
  };

  const statusBody = (student) => (
    <Tag
      value={student.active === false ? "Inativo" : "Ativo"}
      severity={student.active === false ? "danger" : "success"}
    />
  );

  return (
    <div className="eo-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="eo-page-header">
        <div>
          <p className="eo-eyebrow">Gestão</p>
          <h1>Alunos</h1>
        </div>
        {canManage && (
          <Button
            label="Novo aluno"
            icon="pi pi-plus"
            onClick={openCreateDialog}
          />
        )}
      </div>

      <div className="eo-card eo-table-card">
        <div className="eo-table-toolbar">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nome"
            />
          </IconField>
        </div>

        <DataTable
          value={students}
          loading={loading}
          paginator
          rows={10}
          globalFilter={globalFilter}
          globalFilterFields={["name", "email"]}
          emptyMessage="Nenhum aluno cadastrado."
          stripedRows
        >
          <Column field="name" header="Nome" sortable />
          <Column field="email" header="E-mail" sortable />
          <Column header="Situação" body={statusBody} style={{ width: "8rem" }} />
          {canManage && (
            <Column header="Ações" body={actionBody} style={{ width: "7rem" }} />
          )}
        </DataTable>
      </div>

      <Dialog
        header={editingStudent ? "Editar aluno" : "Novo aluno"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "28rem" }}
        modal
      >
        <div className="eo-form">
          <label className="eo-field">
            <span>Nome completo</span>
            <InputText
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="eo-field">
            <span>E-mail</span>
            <InputText
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label className="eo-field">
            <span>
              Senha de acesso
              {editingStudent && " (deixe em branco para manter a atual)"}
            </span>
            <Password
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              toggleMask
              feedback={!editingStudent}
              promptLabel="Digite uma senha"
            />
          </label>

          <p className="eo-form-hint">
            Ao salvar, o aluno é criado com login habilitado imediatamente.
          </p>

          <div className="eo-form-actions">
            <Button
              label="Cancelar"
              text
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={saving ? "Salvando..." : "Salvar"}
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
              disabled={!form.name || !form.email || (!editingStudent && !form.password)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
