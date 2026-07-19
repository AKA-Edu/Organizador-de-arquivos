# 📂 Organizador de Arquivos - CLI (TypeScript & Node.js)

Este é um organizador automático de diretórios de alto desempenho, desenvolvido em **TypeScript Puro** e executado diretamente no terminal (CLI) sob o ambiente **Node.js**. Ele foi feito com o objetivo de varrer uma pasta específica informada pelo usuário (como a pasta de `Downloads`) e organizar automaticamente todos os arquivos contidos na raiz dela, movendo-os com segurança para subpastas estruturadas com base nas suas respectivas extensões.

---

## 🎮 O Projeto

Manter pastas limpas e organizadas manualmente consome tempo e esforço. Com esta ferramenta, você automatiza esse processo instantaneamente:
- O sistema recebe o caminho absoluto ou relativo de uma pasta como parâmetro no terminal.
- Lê todos os arquivos localizados no nível raiz dessa pasta.
- Identifica a extensão de cada arquivo e agrupa-o em categorias pré-definidas.
- Cria subpastas apenas sob demanda (se houver arquivos correspondentes).
- Resolve colisões de nomes de arquivos adicionando sufixos numéricos sequenciais de forma totalmente automatizada (Ex: se já houver um `foto.jpg` na pasta `Imagens`, o novo será movido como `foto_1.jpg`).

### 🛡️ O que o sistema DEVE fazer:
*   **Validar caminhos:** Verificar se o caminho informado realmente existe e se aponta para uma pasta válida.
*   **Isolamento:** Ler apenas arquivos na raiz da pasta-alvo, ignorando subpastas existentes para evitar interferência.
*   **Categorização Automática:** Associar arquivos a pastas apropriadas (`Documentos`, `Imagens`, `Videos`, `Musicas`, `Compactados` e `Outros`).
*   **Tratamento de Conflito:** Garantir que nenhum arquivo existente seja sobrescrito. Adiciona sufixos sequenciais (`_1`, `_2`) se o nome de arquivo já existir na pasta de destino.
*   **Segurança Física:** Nunca excluir arquivos do usuário.
*   **Relatório Detalhado:** Exibir um log final de sucesso contendo a contagem total de arquivos movidos e a de erros identificados.

### 🚫 O que o sistema NÃO DEVE fazer:
*   Não organiza arquivos de forma recursiva (ele mexe apenas nos arquivos soltos da pasta principal).
*   Não requer nenhuma interface gráfica (HTML/CSS) ou conexão com a web.

---

## 🗺️ Fluxo de Execução Lógica (Algoritmo)

O algoritmo segue uma sequência assíncrona robusta para garantir integridade física dos dados e consistência lógica:

```text
       [Início]
          │
          ▼
 [Capturar caminho da pasta via argumento do terminal (process.argv)]
          │
          ▼
   [A pasta existe e é válida?] ──(NÃO)──► [Exibir erro e abortar] ──► [Fim]
          │ (SIM)
          ▼
   [Ler todos os itens com fs.readdir]
          │
          ▼
   [Filtrar apenas ARQUIVOS, ignorando SUBPASTAS]
          │
          ▼
┌──────────────────────────────────────────────┐
│  LOOP PARA CADA ARQUIVO NA LISTA FILTRADA    │ ◄──────────────────────┐
└─────────────────┬────────────────────────────┘                        │
                  │                                                     │
                  ▼                                                     │
   [Extrair extensão (ex: .png) e por em minúscula]                     │
                  │                                                     │
                  ▼                                                     │
   [Consultar categoria correspondente no dicionário]                   │
                  │                                                     │
                  ▼                                                     │
   [Verificar se subpasta da categoria já existe]                       │
          ├── (NÃO) ──► [Criar subpasta com fs.mkdir]                   │
          └── (SIM) ──► [Seguir em frente]                              │
                  │                                                     │
                  ▼                                                     │
   [O arquivo já existe na subpasta de destino?]                        │
          ├── (SIM) ──► [Gerar novo nome com sufixo sequencial (_X)]    │
          └── (NÃO) ──► [Manter nome original]                          │
                  │                                                     │
                  ▼                                                     │
   [Mover arquivo com fs.rename]                                        │
                  │                                                     │
                  ▼                                                     │
   [Incrementar contagem no relatório (Sucesso ou Erro)]                │
                  │                                                     │
                  ▼                                                     │
   [Existem mais arquivos pendentes?] ──(SIM)───────────────────────────┘
          │ (NÃO)
          ▼
 [Exibir relatório com totais de sucesso/erro no terminal]
          │
          ▼
       [Fim]
```

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza o ecossistema moderno de desenvolvimento para Node.js:

*   **[Node.js](https://nodejs.org/)**: Ambiente de execução para rodar Javascript fora do navegador.
    *   Utilização nativa de módulos estáveis de manipulação de disco (`node:fs/promises` e `node:path`).
*   **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática e de prevenção de erros no lado do desenvolvimento.
    *   `Categoria`: Tipo literal restrito a `'Documentos' | 'Imagens' | 'Videos' | 'Musicas' | 'Compactados' | 'Outros'`.
    *   `MapeamentoExtensoes`: Contrato estrito no formato `Record<string, Categoria>` para manter o mapa estático de extensões sincronizado.
*   **[tsx (TypeScript Execute)](https://github.com/privatenumber/tsx)**: Executor rápido do Node.js focado em TypeScript (usa Esbuild internamente) para executar o código diretamente em tempo de desenvolvimento.

---

## 📋 Regras de Categorização

Os arquivos são movidos para as seguintes subpastas de acordo com a extensão original (em letras minúsculas):

| Categoria | Extensões Suportadas |
| :--- | :--- |
| 📄 **Documentos** | `.pdf`, `.docx`, `.txt`, `.xlsx`, `.pptx` |
| 🖼️ **Imagens** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg` |
| 🎬 **Vídeos** | `.mp4`, `.mkv`, `.avi`, `.mov` |
| 🎵 **Músicas** | `.mp3`, `.wav`, `.flac` |
| 📦 **Compactados** | `.zip`, `.rar`, `.7z`, `.tar` |
| 📁 **Outros** | Qualquer outra extensão não listada acima |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (versão 18 ou superior recomendada)
- O gerenciador de pacotes **npm** instalado em sua máquina.

### Passo 1: Instalar Dependências
Abra o terminal do projeto e instale as ferramentas necessárias para compilar e executar o código TypeScript:
```bash
npm install
```

### Passo 2: Executar a Organização
O script de execução rápida está integrado ao seu `package.json`. Você pode rodar a aplicação informando o caminho da pasta que deseja organizar após as duas barras `--`:

```bash
npm start -- <caminho_da_pasta>
```

#### Exemplos de Uso prático:

*   **Organizar uma pasta dentro do projeto:**
    ```bash
    npm start -- ./minha_pasta_baguncada
    ```

*   **Organizar a pasta de Downloads do seu computador (Windows):**
    ```bash
    npm start -- C:\Users\NomeDoUsuario\Downloads
    ```

*   **Organizar a pasta de Downloads do seu computador (Linux/macOS):**
    ```bash
    npm start -- ~/Downloads
    ```

---

## 📁 Estrutura de Arquivos do Projeto

*   `main.ts`: Ponto de entrada do script com a inteligência e rotinas de organização.
*   `package.json`: Manifesto com os scripts de inicialização rápida (`npm start`) e dependências do ambiente.
*   `tsconfig.json`: Definições rígidas do compilador TypeScript (`target: ES2022`, `moduleResolution: NodeNext`).
*   `.plan/.plano.md`: Plano de desenvolvimento e especificações de Requisitos de Produto (PRD).
*   `README.md`: Este guia completo de explicação e operação.
