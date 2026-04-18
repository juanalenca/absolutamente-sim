# ISO 20000 - Process vs. Pressure

**ISO 20000 - Process vs. Pressure** é um projeto gamificado interativo (web-based) voltado ao treinamento e simulação de rotinas de Gerenciamento de Serviços de TI baseadas na **ISO 20000**. No jogo, você assume o papel de um algoritmo em treinamento dentro de um "Sistema de Decisão Automatizada" de um hospital, sendo responsável por aprovar ou rejeitar tickets de incidentes e requisições de mudança (RFCs), seguindo rigorosamente as regras do protocolo.

![Screenshot Game](https://via.placeholder.com/800x400?text=ISO+20000+-+Process+vs.+Pressure)

## Sumário
- [Recursos Principais](#recursos-principais)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Regras do Jogo](#regras-do-jogo)
- [Como Jogar Localmente](#como-jogar-localmente)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)

---

## Recursos Principais

- ⏱️ **Simulação sob Pressão:** Experimente a rotina de um departamento de TI onde agilidade e SLA importam, mas a qualidade processual não pode ser comprometida.
- 📈 **Dificuldade Progressiva:** O jogo é dividido em 7 "dias". A cada novo dia, parâmetros como Criticidade de Ativos (Alta, Média, Baixa), Níveis de Risco, exigência de Rollbacks e aprovação do Comitê de Mudanças (CAB) são adicionados ao escopo.
- 🎛️ **Feedback Visual e Sonoro Imersivo:** Efeitos de *glitch* na tela e sons retro/sintetizados usando `Tone.js` penalizam os erros ao vivo para gerar imersão.
- 📊 **Relatórios Diários:** Receba métricas ao fim do seu turno avaliando precisão e assertividade de suas decisões.
- 📚 **Base de Conhecimento:** Um glossário integrado e árvores de decisão auxiliam o jogador a aprender termos de ITSM enquanto joga.

---

## Estrutura do Projeto

O código do projeto foi modulado para melhor manutenção:

```bash
/
├── index.html       # Visualização principal, importação do Tailwind e estrutura DOM base.
├── css/
│   └── styles.css   # Definições avançadas de UI, animações, keyframes de glitch e layouts customizados.
├── js/
│   └── app.js       # Arquivo de lógica principal do game: dados TICKET_DATA, game loop e manipulação de estado.
└── README.md        # Documentação do projeto.
```

---

## Regras do Jogo

O simulador avalia em tempo real suas decisões baseadas em regras de maturidade de processo. Durante a semana simulada as regras testam seu domínio:

1. **Incidentes (RI):** A prioridade e impacto devem sempre estar definidos. O foco inicial do treinamento.
2. **Mudanças (RFC):** Avalie quem são os aprovadores, quais ativos sofrem impactos (Ex: SRV-DB-01) e se existe um plano de Rollback consistente acoplado quando tratamos de mudanças de Risco Alto ou Médio.
3. **Consistência de Identidade:** Cruza os cargos de funcionários e Departamentos simulados do hospital contra fraudes ou inconguências. As requisições precisam espelhar os perfis da infraestrutura.

Erros repetidos culminarão em instabilidade crônica do "Sistema Automatizado", resultando em demissão virtual no Dia 7.

---

## Como Jogar Localmente

Este projeto roda inteiramente via client-side (Frontend puro), não necessitando de backend ou build steps. 

1. Clone o repositório em sua máquina:
   ```bash
   git clone https://github.com/juanalenca/absolutamente-sim.git
   ```
2. Abra a pasta do projeto.
3. Arraste e solte o arquivo `index.html` em seu navegador de preferência (Google Chrome, Firefox, ou Edge Chrome, por exemplo).
4. Recomenda-se aumentar um pouco o volume do sistema para usufruir da sonoplastia interativa de respostas.

---

## Tecnologias Utilizadas

- **HTML5 & Vanilla JavaScript**: Lógica do jogo e manipulação do DOM sem uso de frameworks pesados garantindo extrema velocidade.
- **TailwindCSS (via CDN)**: Utility-first para montagem responsiva e moderna de estilo básico da interface.
- **CSS3 Personalizado**: Utilizado para animações complexas como *Glitch*, Glassmorphism customizado, Tooltips interativos e Blur.
- **Tone.js**: Synthetizador e framework de web audio para feedback responsivo por ações e eventos no jogo.

---
_Aviso legal: O conteúdo narrativo deste software (Hospital, CABs e perfis dos envolvidos) é inteiramente fictício e gerado para prover desafio gamificado aos ensinamentos da norma._
