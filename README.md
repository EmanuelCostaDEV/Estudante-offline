# Estudante Offline — Frontend

Cliente React (Vite + PrimeReact) para o sistema de gestão escolar
Estudante Offline. Consome a API Node.js/Express local em
`http://localhost:3000`.

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`. Certifique-se de que a API
backend esteja rodando em `http://localhost:3000` (URL configurada em
`src/services/api.js`).

## Estrutura de pastas

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                 # bootstrap, PrimeReactProvider, tema
    ├── App.jsx                  # definição de rotas e proteção por role
    ├── index.css                # tokens de design globais (cores, tipografia)
    ├── contexts/
    │   └── AuthContext.jsx      # contexto global de autenticação (JWT, role)
    ├── routes/
    │   └── PrivateRoute.jsx     # guarda de rota (autenticação + role)
    ├── services/
    │   ├── api.js               # instância axios + injeção do Bearer token
    │   ├── authService.js
    │   ├── studentService.js
    │   ├── classService.js
    │   ├── enrollmentService.js
    │   ├── gradeService.js
    │   └── examService.js
    ├── components/
    │   └── Layout/
    │       ├── MainLayout.jsx   # shell com menu lateral adaptado por role
    │       └── MainLayout.css
    └── pages/
        ├── auth/Login.jsx (+ .css)
        ├── errors/AccessDenied.jsx (+ .css)
        ├── dashboard/Dashboard.jsx (+ .css)
        ├── students/StudentsList.jsx (+ .css)   # CRUD completo (exemplo de referência)
        ├── classes/ClassesList.jsx
        ├── enrollments/EnrollmentsList.jsx
        ├── grades/GradesList.jsx
        ├── exams/ExamsCalendar.jsx
        └── student/StudentDashboard.jsx (+ .css) # visão relacional do aluno
```

## Regras de acesso implementadas

- **Admin**: acesso total; único perfil que pode criar/editar/remover alunos
  e turmas, e gerenciar matrículas.
- **Professor**: visualiza a listagem de alunos (somente leitura) e tem CRUD
  completo em Notas e Agendamento de Provas.
- **Aluno**: não acessa telas de gestão; é direcionado a um painel próprio
  (`StudentDashboard`) que cruza suas turmas, provas agendadas e notas.

O `PrivateRoute` bloqueia acesso direto via URL: usuários sem a role exigida
são redirecionados para `/acesso-negado`.
