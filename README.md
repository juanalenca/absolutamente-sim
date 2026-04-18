# ISO 20000 - Process vs. Pressure

**ISO 20000 - Process vs. Pressure** é um "serious game" (simulador educacional) focado nas práticas e protocolos estritos do Gerenciamento de Serviços de TI baseados na norma **ISO 20000**. 

Neste jogo para navegador, você é designado como o "algoritmo em treinamento" de um Sistema de Decisão Automatizada (S.D.A.) recém-instalado em um hospital altamente tecnológico. Sua única função: **julgar implacavelmente tickets de infraestrutura** e decidir o que é aprovado ou rejeitado de acordo com os cruéis processos de conformidade corporativa e disponibilidade hospitalar.

## Intuito do Projeto

O objetivo primário deste software é substituir o aprendizado maçante e puramente teórico da norma ISO 20000 por uma experiência imersiva e de alta tensão mecânica. Ao invés de ler que "mudanças de alto risco necessitam de fallback e aprovação do Comitê", o jogador é punido sonoro e visualmente por deixar um ticket como este passar batido em situações de grave instabilidade sistêmica.

## Lógica e O Que Tem no Jogo

O jogo não é sobre consertar impressoras ou atualizar bancos de dados, mas sim sobre **Decisão sob Condicionais Rigorosas**. O jogador deve checar variáveis de congruência lógica para cada novo Incidente (RI) ou Request for Change (RFC). A lógica operacional inclui:

- **Análise de Hierarquia (Assinaturas):** Quem está solicitando? Risco Baixo pode ser liberado por Gerentes L1. Alto e Médio necessitam estritamente da aprovação dos diretores do CAB (Change Advisory Board).
- **Tratativa Lógica Pragmática:** Se a RFC for de Alto Risco e modificar infraestrutura crítica, precisa de um Plano de Rollback detalhado anexado. Do contrário, reprovação imediata.
- **Checagem de Identidade e Ativos:** Solicitantes tentando aprovar tickets em departamentos incompatíveis com seus cadastros, ou declarando um Risco "Baixo" num Servidor Crítico Hospitalar configuram falsos-positivos perigosos.
- **SLA e Tempo (Pressure):** Quando o cronômetro começa a rodar nos últimos dias, o jogador deve analisar cruzamento de todas essas variáveis nos tickets com o tempo explodindo.

## Como o Jogo Funciona (Funcionalidades)

- ⏳ **Jornada de 7 Dias:** A dificuldade não é estática. A cada novo "Dia" virtual, mais lógicas (novas abas de regras) se somam tornando a matriz de decisão exponencialmente mais arriscada.
- 🔴 **Punibilidade Áudio-Visual Intensiva:** Utilizando a biblioteca `Tone.js`, você é audível e interativamente punido no navegador, e a UI sofre "derretimentos" e *Glitches* visuais no padrão *System Failure* a cada erro de parâmetro técnico e reprovação incorreta.
- 📖 **Central de Ativos e Manuais Vivos:** Contém um mini-banco de dados in-game (Manual de Regras, Inventário de Ativos, Pessoal e Glossário ITIL/ISO) construído em modais e tooltips centralizados na tela para consulta rápida e dinâmica.
- 📋 **Relatórios de Desempenho e Demissão:** Ao final de cada "dia simulado", seu desempenho de precisão é exposto. Falhas excessivas até o 7º dia levam a avaliação direta de "Contrato Encerrado" por alto percentual de ineficiência e risco arquitetural introduzido no hospital.

---

## Estrutura do Projeto

O código do projeto adota uma arquitetura Client-Side, dividindo as responsabilidades lógicas e cosméticas:

```bash
/
├── index.html       # Visualização principal, importação do Tailwind e estrutura DOM base.
├── css/
│   └── styles.css   # Definições avançadas de UI, animações, keyframes de glitch e layouts customizados.
├── js/
│   └── app.js       # Core em Vanilla JS: arrays multidimensionais para os Tickets, game loop diário e interceptação lógica de SLA.
└── README.md        # Documentação.
```

---

## Como Rodar e Testar

Sendo um projeto desenhado inteiramente em tecnologias do frontend puro para fins performáticos:

1. Faça o clone do repositório em sua máquina:
   ```bash
   git clone https://github.com/juanalenca/absolutamente-sim.git
   ```
2. Abra a raiz do projeto.
3. Não há necessidade de build. Arraste e solte o arquivo `index.html` em seu navegador padrão.
4. **Nota essencial:** Recomenda-se jogar de headphones ou caixas de som habilitadas para total envolvimento no clima tenso gerado pelos sons do sintetizador local.

---

_Aviso legal: O conteúdo narrativo envolvendo o hospital, diretoria fictícia (Dr. House, Miranda e associados) e os incidentes relatados no software são ilustrativos, desenhados para compor um ambiente crítico e divertido no simulador de aprovação da matriz normativa técnica da ISO._
