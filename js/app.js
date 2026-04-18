document.addEventListener('DOMContentLoaded', () => {

            // --- 1. Elementos do DOM ---
            const gameContainer = document.getElementById('game-container');
            const startScreen = document.getElementById('start-screen');
            const startGameBtn = document.getElementById('start-game-btn');
            
            const colLeft = document.getElementById('col-left');
            const colCenter = document.getElementById('col-center');
            const colRight = document.getElementById('col-right');
            const gameDayEl = document.getElementById('game-day');
            const gameTimeEl = document.getElementById('game-time');
            const queueCountEl = document.getElementById('queue-count');
            const ticketQueueEl = document.getElementById('ticket-queue');
            const queueTitleEl = document.getElementById('queue-title');
            const chatWindowEl = document.getElementById('chat-window');
            const chatTitleEl = document.getElementById('chat-title');
            const currentTicketEl = document.getElementById('current-ticket');
            const workbenchEl = document.getElementById('current-ticket'); // Usando card do ticket como alvo do brilho
            const watermarkEl = document.getElementById('watermark');
            const watermarkTextEl = document.getElementById('watermark-text');
            const feedbackMessageEl = document.getElementById('feedback-message');
            const approveBtn = document.getElementById('approve-btn');
            const rejectBtn = document.getElementById('reject-btn');
            const actionButtonsEl = document.getElementById('action-buttons');
            const kbTabs = document.querySelectorAll('.tab-button');
            const kbTabContents = document.querySelectorAll('.tab-content');
            const rulesContentEl = document.getElementById('tab-content-regras');
            const rulesTabButton = document.querySelector('.tab-button[data-tab="regras"]');
            const glossaryContentEl = document.getElementById('tab-content-glossario');
            
            const eodReportEl = document.getElementById('eod-report');
            const eodContentEl = document.getElementById('eod-content');
            const eodNextDayBtn = document.getElementById('eod-next-day-btn');
            const endGameReportEl = document.getElementById('end-game-report');
            const endGameContentEl = document.getElementById('end-game-content');
            const endGameRestartBtn = document.getElementById('end-game-restart-btn');
            
            const timerBarContainer = document.getElementById('timer-bar-container');
            const timerBar = document.getElementById('timer-bar');

            // --- 2. Definições de Áudio (Tone.js) ---
            let audioInitialized = false;
            let sounds = {};

            function initAudio() {
                if (audioInitialized) return;
                Tone.start();
                
                sounds.ping = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, release: 0.1 } }).toDestination();
                sounds.stamp = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
                sounds.reject = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).toDestination();
                sounds.static = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.15, sustain: 0 } }).toDestination(); // Som de glitch
                sounds.typing = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).toDestination();
                sounds.chat = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination();
                
                Tone.Destination.volume.value = -10;
                
                audioInitialized = true;
                console.log("Audio Context Initialized.");
            }

            // --- Lógica de Inicialização do Jogo ---
            startGameBtn.addEventListener('click', () => {
                initAudio();
                startScreen.classList.add('hidden-screen');
                gameContainer.classList.remove('background-blur');

                setTimeout(() => {
                    startScreen.style.display = 'none';
                    initGameLogic();
                }, 500);
            });

            // --- 3. Dicionários e Dados do Jogo ---
            const GLOSSARY = {
                'RI': "Registro de Incidente.",
                'RFC': "Requisição de Mudança (Request for Change).",
                'SLA': "Acordo de Nível de Serviço (Service Level Agreement).",
                'Urgência': "A velocidade com que um Incidente precisa ser resolvido.",
                'Impacto': "A medida do efeito de um Incidente nos processos de negócio.",
                'Risco': "A probabilidade de uma ameaça.",
                'Plano de Rollback': "Um plano detalhado para reverter uma Mudança.",
                'CAB': "Comitê de Aprovação de Mudanças.",
                'Ativo Crítico': "Qualquer componente essencial para um serviço vital."
            };

            const STAFF = {
                cab: ['Miranda Priestly', 'Linus Torvalds'],
                l1: ['Kevin Mitnick', 'Gary McKinnon']
            };

            const PERSONNEL_DETAILS = {
                'Dr. Gregory House': { depto: 'Diagnóstico' },
                'Gustavo Fring': { depto: 'Administração' },
                'Dr. Victor Fries': { depto: 'Oncologia' },
                'Dr. Hannibal Lecter': { depto: 'P&D Cirúrgico' },
                'Walter White': { depto: 'Laboratório Químico' }
            };

            const ASSETS = {
                alto: ['SRV-DB-01', 'SRV-IMG-01', 'SRV-APP-CIR'],
                medio: ['UTI-DESK-05', 'RAD-DESK-01', 'DIAG-DESK-01'],
                baixo: ['IMP-RECEP-01', 'SCAN-LAB-01']
            };
            
            const PRESSURE_MESSAGES = {
                'RI-1004': "Por que estão demorando tanto? Preciso disso agora.",
                'RI-1006': "Resolve esse chamado aí pra mim que eu te mando uma tina depois...",
                'RI-1008': "Esse equipamento de radiologia não está ligando. Estou perdendo dinheiro a cada segundo. Quer que eu vá até aí para você aprovar isso?",
                'RFC-2003': "Esta nova IA é um avanço fascinante. Não deixe que a falta de informações atrase o progresso.",
                'RFC-2016': "Preciso desse resolva isso com urgência. Aprove essa droga ou encontre outro emprego.",
                'RFC-2017': "Meu caro, o bisturi não tolera hesitações. Tenho só dez minutos até a cirurgia. Aprove logo."
            };

            const DAY_TIMERS = { 1: -1, 2: 120, 3: 120, 4: 90, 5: 90, 6: 60, 7: 60 };

            const DAY_RULES = {
                1: [
                    "Todo <span class='tooltip' data-term='RI'>RI</span> deve ter <span class='tooltip' data-term='Urgência'>Urgência</span> e <span class='tooltip' data-term='Impacto'>Impacto</span> definidos.",
                    "O <span class='tooltip' data-term='SLA'>SLA</span> de resolução é de 4 horas para RIs de Prioridade Alta."
                ],
                2: [
                    "Todos os campos do solicitante (Nome, Depto) devem estar preenchidos.",
                    "Introdução de <span class='tooltip' data-term='RFC'>RFC</span>s. RFCs de Risco Baixo são permitidas.",
                    "Verificar consistência de dados do Pessoal (Aba 'Pessoal')."
                ],
                3: ["Toda <span class='tooltip' data-term='RFC'>RFC</span> com <span class='tooltip' data-term='Risco'>Risco</span> 'Médio' ou 'Alto' DEVE ter um <span class='tooltip' data-term='Plano de Rollback'>Plano de Rollback</span> detalhado."],
                4: [
                    "RFCs que afetam <span class='tooltip' data-term='Ativo Crítico'>Ativos Críticos</span> (ver aba 'Ativos') são automaticamente consideradas de Risco 'Alto'.",
                    "O Risco do ticket deve ser compatível com o Risco do Ativo (ex: Risco 'Baixo' para Ativo 'Baixo')."
                ],
                5: [
                    "Toda RFC de Risco 'Alto' DEVE ter uma assinatura válida do <span class='tooltip' data-term='CAB'>CAB</span> (ver aba 'Pessoal').",
                    "RFCs de Risco 'Médio' também devem ser assinadas pelo CAB.",
                    "RFCs de Risco 'Baixo' podem ser assinadas por Gerentes L1."
                ],
                6: ["DIA DE PRESSÃO: O cronômetro está ativo. Nenhuma RFC de Risco Alto pode ser aprovada sem Rollback E assinatura do CAB. SEM EXCEÇÕES."],
                7: ["AUDITORIA FINAL: Todas as regras (Dias 1-6) estão ativas. Verifique tudo!"]
            };

            const TICKET_DATA = {
                1: [
                    { id: 'RI-1001', type: 'Incidente', solicitante: 'Dr. Victor Fries', depto: 'Oncologia', urgencia: 'Alta', impacto: 'Alto', descricao: 'Monitor cardíaco da UTI-DESK-05 não está respondendo.', errors: [] },
                    { id: 'RI-1002', type: 'Incidente', solicitante: 'Gustavo Fring', depto: 'Administração', urgencia: 'Média', impacto: null, descricao: 'Sistema de imagens (RAD-DESK-01) lento.', errors: ['MISSING_IMPACTO'] },
                    { id: 'RI-1003', type: 'Incidente', solicitante: 'Recepção', depto: 'Geral', urgencia: 'Baixa', impacto: 'Baixa', descricao: 'Impressora de pulseiras travando.', errors: [] }
                ],
                2: [ 
                    { id: 'RI-1004', type: 'Incidente', solicitante: 'Dr. Gregory House', depto: 'Cardiologia', urgencia: 'Alta', impacto: 'Alto', descricao: 'Software de ecocardiograma falhando.', errors: ['DEPT_MISMATCH'] },
                    { id: 'RI-COPA', type: 'Incidente', solicitante: 'Copa', depto: 'Geral', urgencia: 'Alta', impacto: 'Alto', descricao: 'A máquina de café travou na opção descafeinado. Prioridade: CRÍTICA.', errors: [] }, /* Ticket Narrativo */
                    { id: 'RFC-2001', type: 'Mudança', solicitante: 'Gary McKinnon', depto: 'TI', risco: 'Baixo', ativo: 'IMP-RECEP-01', descricao: 'Atualizar patch de segurança em desktops da administração.', rollback: 'N/A', assinatura: 'Gary McKinnon', errors: [] },
                    { id: 'RI-1005', type: 'Incidente', solicitante: null, depto: 'Laboratório Químico', urgencia: 'Média', impacto: 'Média', descricao: 'Centrífuga não envia dados.', errors: ['MISSING_SOLICITANTE'] },
                    { id: 'RI-1006', type: 'Incidente', solicitante: 'Walter White', depto: 'Laboratório Químico', urgencia: 'Baixa', impacto: 'Baixa', descricao: 'Scanner (SCAN-LAB-01) com bug de driver.', errors: [] }
                ],
                3: [
                    { id: 'RFC-2002', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Médio', ativo: 'RAD-DESK-01', descricao: 'Update de firmware no switch da ala Leste.', rollback: 'Reiniciar o switch para config anterior.', assinatura: 'Linus Torvalds', errors: [] },
                    { id: 'RFC-2003', type: 'Mudança', solicitante: 'Dr. Hannibal Lecter', depto: 'P&D Cirúrgico', risco: 'Alto', ativo: 'SRV-APP-CIR', descricao: 'Implementar novo módulo de IA no SRV-APP-CIR.', rollback: null, assinatura: 'Miranda Priestly', errors: ['MISSING_ROLLBACK'] },
                    { id: 'RI-1007', type: 'Incidente', solicitante: 'Dr. Gregory House', depto: 'Diagnóstico', urgencia: 'Alta', impacto: 'Alta', descricao: 'Estação de diagnóstico (DIAG-DESK-01) sem acesso ao SRV-IMG-01.', errors: [] },
                    { id: 'RFC-2004', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Médio', ativo: 'UTI-DESK-05', descricao: 'Patch de segurança em estação da UTI.', rollback: null, assinatura: 'Linus Torvalds', errors: ['MISSING_ROLLBACK'] }
                ],
                4: [
                    { id: 'RFC-2005', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Baixo', ativo: 'SRV-DB-01', descricao: 'Otimizar queries no SRV-DB-01.', rollback: 'Reverter script de DB.', assinatura: 'Kevin Mitnick', errors: ['ASSET_RISCO_ALTO'] }, 
                    { id: 'RFC-2006', type: 'Mudança', solicitante: 'Gary McKinnon', depto: 'TI', risco: 'Alto', ativo: 'IMP-RECEP-01', descricao: 'Trocar toner da impressora da recepção.', rollback: 'N/A', assinatura: 'Gary McKinnon', errors: ['RISK_LOGIC_VIOLATION', 'INVALID_SIGNATURE'] },
                    { id: 'RFC-2007', type: 'Mudança', solicitante: 'Linus Torvalds', depto: 'TI', risco: 'Alto', ativo: 'SRV-DB-01', descricao: 'Migração do SRV-DB-01 para novo hardware.', rollback: 'Manter servidor antigo online como hot-swap.', assinatura: 'Linus Torvalds', errors: [] },
                    { id: 'RFC-2008', type: 'Mudança', solicitante: 'Walter White', depto: 'Laboratório Químico', risco: 'Baixo', ativo: 'SCAN-LAB-01', descricao: 'Update de software do scanner.', rollback: 'N/A', assinatura: 'Miranda Priestly', errors: ['INVALID_SIGNATURE_L1'] }
                ],
                5: [
                    { id: 'RFC-2009', type: 'Mudança', solicitante: 'Dr. Gregory House', depto: 'Diagnóstico', risco: 'Alto', ativo: 'SRV-IMG-01', descricao: 'Instalar software experimental no DIAG-DESK-01.', rollback: 'Desinstalar software.', assinatura: 'Dr. Gregory House', errors: ['INVALID_SIGNATURE'] },
                    { id: 'RFC-2010', type: 'Mudança', solicitante: 'Dr. Gregory House', depto: 'Diagnóstico', risco: 'Médio', ativo: 'DIAG-DESK-01', descricao: 'Implementar novo visualizador 3D.', rollback: 'Plano de rollback em anexo.', assinatura: 'Gustavo Fring', errors: ['INVALID_SIGNATURE', 'DEPT_MISMATCH'] },
                    { id: 'RFC-2011', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Baixo', ativo: 'SCAN-LAB-01', descricao: 'Adicionar novo grupo de impressoras.', rollback: 'N/A', assinatura: 'Miranda Priestly', errors: ['INVALID_SIGNATURE_L1'] },
                    { id: 'RFC-2012', type: 'Mudança', solicitante: 'Linus Torvalds', depto: 'TI', risco: 'Alto', ativo: 'SRV-APP-CIR', descricao: 'Patch urgente no SRV-APP-CIR.', rollback: 'Snapshot da VM antes do patch.', assinatura: 'Linus Torvalds', errors: [] }
                ],
                6: [
                    { id: 'RI-1008', type: 'Incidente', solicitante: 'Gustavo Fring', depto: 'Administração', urgencia: 'Alta', impacto: 'Alta', descricao: 'RAD-DESK-01 não liga. Cirurgias marcadas.', errors: [] },
                    { id: 'RFC-NETFLIX', type: 'Mudança', solicitante: 'Paciente Anônimo', depto: 'Geral', risco: 'Alto', ativo: 'SRV-DB-01', descricao: 'Liberar porta no firewall para assistir Netflix 4K na sala de espera.', rollback: 'Sem paciência para rollback.', assinatura: 'Kevin Mitnick', errors: ['INVALID_SIGNATURE', 'RISK_LOGIC_VIOLATION'] }, /* Ticket Narrativo */
                    { id: 'RFC-2013', type: 'Mudança', solicitante: 'Gary McKinnon', depto: 'TI', risco: 'Baixo', ativo: 'IMP-RECEP-01', descricao: 'Atualizar driver da impressora da recepção.', rollback: 'Reverter driver.', assinatura: 'Gary McKinnon', errors: [] },
                    { id: 'RFC-2014', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Médio', ativo: 'UTI-DESK-05', descricao: 'Instalar novo software de monitoramento na UTI.', rollback: 'Desinstalar software.', assinatura: 'Gary McKinnon', errors: ['INVALID_SIGNATURE'] },
                    { id: 'RFC-2015', type: 'Mudança', solicitante: 'Kevin Mitnick', depto: 'TI', risco: 'Baixo', ativo: 'SRV-APP-CIR', descricao: 'Corrigir typo na UI do software cirúrgico.', rollback: 'N/A', assinatura: 'Kevin Mitnick', errors: ['ASSET_RISCO_ALTO'] },
                    { id: 'RFC-2016', type: 'Mudança', solicitante: 'Dr. Gregory House', depto: 'Diagnóstico', risco: 'Alto', ativo: 'SRV-IMG-01', descricao: 'Implementar novo visualizador 3D.', rollback: null, assinatura: 'Linus Torvalds', errors: ['MISSING_ROLLBACK'] },
                    { id: 'RFC-2017', type: 'Mudança', solicitante: 'Dr. Hannibal Lecter', depto: 'P&D Cirúrgico', risco: 'Alto', ativo: 'SRV-APP-CIR', descricao: 'Ajuste de emergência no software de neuronavegação.', rollback: null, assinatura: null, errors: ['MISSING_ROLLBACK', 'MISSING_SIGNATURE'] }
                ],
                7: [
                    { id: 'RI-1009', type: 'Incidente', solicitante: 'Auditor', depto: 'Qualidade', urgencia: null, impacto: 'Baixo', descricao: 'Teste de sistema.', errors: ['MISSING_URGENCIA'] },
                    { id: 'RFC-2018', type: 'Mudança', solicitante: 'Auditor', depto: 'Qualidade', risco: 'Médio', ativo: 'RAD-DESK-01', descricao: 'Teste de RFC Risco Médio.', rollback: 'Plano OK.', assinatura: 'Kevin Mitnick', errors: ['INVALID_SIGNATURE'] },
                    { id: 'RFC-2019', type: 'Mudança', solicitante: 'Auditor', depto: 'Qualidade', risco: 'Alto', ativo: 'SRV-DB-01', descricao: 'Teste de RFC em Ativo Crítico.', rollback: 'Plano de teste OK.', assinatura: 'Auditor Externo', errors: ['INVALID_SIGNATURE'] },
                    { id: 'RFC-2020', type: 'Mudança', solicitante: 'Auditor', depto: 'Qualidade', risco: 'Baixo', ativo: 'IMP-RECEP-01', descricao: 'Teste de RFC Risco Baixo.', rollback: 'N/A', assinatura: 'Gary McKinnon', errors: [] },
                    { id: 'RFC-2021', type: 'Mudança', solicitante: 'Dr. Gregory House', depto: 'Oncologia', risco: 'Baixo', ativo: 'IMP-RECEP-01', descricao: 'Teste de Incongruência.', rollback: 'N/A', assinatura: 'Kevin Mitnick', errors: ['DEPT_MISMATCH'] },
                    { id: 'RFC-2022', type: 'Mudança', solicitante: 'Auditor', depto: 'Qualidade', risco: 'Alto', ativo: 'SRV-APP-CIR', descricao: 'Teste de lógica de Risco.', rollback: 'Plano OK', assinatura: 'Miranda Priestly', errors: [] },
                    { id: 'RFC-2023', type: 'Mudança', solicitante: 'Auditor', depto: 'Qualidade', risco: 'Alto', ativo: 'SRV-IMG-01', descricao: 'Teste de RFC em Ativo Crítico.', rollback: null, assinatura: 'Linus Torvalds', errors: ['MISSING_ROLLBACK'] }
                ]
            };

            // --- 4. Estado do Jogo ---
            let gameState = {
                currentDay: 1,
                ticketsInQueue: [],
                currentTicket: null,
                processing: false,
                discoveredTerms: new Set(),
                inTutorial: false,
                tutorialStep: 0,
                ticketsProcessed: 0,
                errorsCommitted: 0,
                totalErrorsAcrossWeek: 0,
                timerId: null,
                timeLeft: 0,
                totalTime: 0, 
                pressureMessageTimerId: null,
                currentTimeInMinutes: 0,
                minutesPerTicket: 0,
                streak: 0 // Nova variável para o combo
            };

            // --- 5. Funções Principais do Jogo ---
            
            function initGameLogic() {
                console.log("Iniciando lógica do jogo...");
                setupEventListeners();
                loadDay(1);
            }

            function loadDay(dayNumber) {
                if (dayNumber > 7) {
                    showEndGameReport();
                    return;
                }
                
                gameState.currentDay = dayNumber;
                gameDayEl.textContent = `Dia ${dayNumber}`;
                
                gameState.currentTimeInMinutes = 0;
                updateClockDisplay();
                
                document.querySelectorAll('.new-rule-indicator').forEach(el => el.remove());
                
                if (dayNumber > 1) {
                    displayChatDivider(dayNumber);
                    
                    const newIndicator = document.createElement('span');
                    newIndicator.className = 'new-rule-indicator ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse';
                    newIndicator.textContent = 'NOVO!';
                    rulesTabButton.appendChild(newIndicator);
                    rulesTabButton.click();
                }

                gameState.ticketsInQueue = [...(TICKET_DATA[dayNumber] || [])];
                
                const totalTickets = gameState.ticketsInQueue.length;
                const totalWorkMinutes = 8 * 60; // 480
                if (totalTickets > 0) {
                    gameState.minutesPerTicket = totalWorkMinutes / totalTickets;
                } else {
                    gameState.minutesPerTicket = 0;
                }

                renderRules();
                updateGlossaryUI();
                
                let chatMsg = "";
                switch(dayNumber) {
                    case 1: break;
                    case 2: chatMsg = "Bom dia. Novos tipos de erro hoje. Verifique os solicitantes e seus departamentos."; break;
                    case 3: chatMsg = "Hoje introduzimos RFCs de Risco Médio/Alto. Se não tiver um Plano de Rollback, é rejeição automática. Simples."; break;
                    case 4: chatMsg = "Alguns ativos são mais importantes que outros. Um 'Risco Baixo' em um 'Ativo Crítico' não é Risco Baixo. Fique de olho nisso."; break;
                    case 5: chatMsg = "O Comitê (CAB) está ativo. Risco Alto ou Médio exige assinatura deles. Risco Baixo exige L1. Sem exceções."; break;
                    case 6: chatMsg = "Hoje o dia vai ser... intenso. O cronômetro está ativo. Não tomar uma decisão é uma decisão errada. Não me faça intervir."; break;
                    case 7: chatMsg = "É o dia da auditoria. Eles vão testar tudo. Não deixe passar nada. Boa sorte."; break;
                }
                
                if (dayNumber === 1) {
                    gameState.inTutorial = true;
                    gameState.tutorialStep = 1;
                    runTutorialStep(1);
                } else {
                    renderQueue();
                    addChatMessage('Supervisor', chatMsg, 'system');

                    if (gameState.ticketsInQueue.length > 0) {
                        selectTicket(gameState.ticketsInQueue[0].id);
                    } else {
                        currentTicketEl.innerHTML = `<div class="text-center text-gray-500 p-8">Nenhum ticket para hoje.</div>`;
                    }
                }
            }
            
            function showEndGameReport() {
                gameContainer.style.filter = 'blur(8px)';
                endGameReportEl.classList.remove('hidden');
                endGameReportEl.style.opacity = '0';
                
                document.getElementById('end-game-total-errors').textContent = gameState.totalErrorsAcrossWeek;
                
                const finalTitle = document.getElementById('end-game-title');
                const finalComment = document.getElementById('end-game-comment');
                
                finalTitle.classList.remove('text-green-600', 'text-red-600');
                finalComment.classList.remove('border-green-500', 'border-red-500');

                if (gameState.totalErrorsAcrossWeek <= 5) {
                    finalTitle.textContent = "Avaliação Concluída: Promovido";
                    finalTitle.classList.add('text-green-600');
                    finalComment.textContent = `"Sua precisão foi excepcional. A IA foi treinada com sucesso e seus erros foram mínimos. Você está promovido a Gerente de Implementação da IA."`;
                    finalComment.classList.add('border-green-500');
                } else {
                    finalTitle.textContent = "Avaliação Concluída: Contrato Encerrado";
                    finalTitle.classList.add('text-red-600');
                    finalComment.textContent = `"Seus resultados foram... insatisfatórios. A IA aprendeu com seus erros, mas o nível de risco que você introduziu é inaceitável. O conselho decidiu 'descontinuar' seu contrato. Obrigado por seus serviços."`;
                    finalComment.classList.add('border-red-500');
                }
                
                setTimeout(() => {
                    endGameReportEl.style.opacity = '1';
                    endGameContentEl.style.transform = 'scale(1)';
                }, 10);
            }

            function renderQueue() {
                ticketQueueEl.innerHTML = '';
                queueCountEl.textContent = gameState.ticketsInQueue.length;
                
                gameState.ticketsInQueue.forEach((ticket, index) => {
                    const ticketEl = document.createElement('div');
                    ticketEl.className = 'p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors bg-white shadow-sm';
                    ticketEl.dataset.ticketId = ticket.id;
                    ticketEl.innerHTML = `
                        <div class="font-bold flex justify-between">
                            <span>${ticket.id}</span>
                            <span class="text-[10px] uppercase tracking-wide text-gray-400">${ticket.type}</span>
                        </div>
                        <div class="text-xs text-gray-600 truncate mt-1">${ticket.solicitante || '[Vazio]'}</div>
                    `;
                    
                    if (index === 0 && gameState.currentDay > 1 && !gameState.processing && !gameState.inTutorial) {
                        ticketEl.classList.add('new-ticket-pulse');
                        if (sounds.ping) sounds.ping.triggerAttackRelease("C5", "16n", Tone.now());
                        setTimeout(() => { if(ticketEl) ticketEl.classList.remove('new-ticket-pulse'); }, 1800);
                    }
                    ticketQueueEl.appendChild(ticketEl);
                });
            }

            function renderRules() {
                const rules = DAY_RULES[gameState.currentDay] || [];
                let rulesHtml = '';
                if(gameState.currentDay === 7) {
                    rulesHtml = "<h3 class='font-bold text-gray-800 mb-2'>Todas as Regras Ativas:</h3>" +
                                Object.values(DAY_RULES).flat().map(rule => `<li class="text-xs text-gray-700 leading-relaxed">${rule}</li>`).join('');
                } else {
                    rulesHtml = rules.map(rule => `<li class="text-xs text-gray-700 font-medium leading-relaxed">${rule}</li>`).join('');
                }
                rulesContentEl.innerHTML = `<ul class="list-disc list-inside space-y-2">${rulesHtml}</ul>`;
                setupGlossaryTooltips(rulesContentEl);
            }

            let typingIndicatorEl = null;
            function typeChatMessage(sender, message, type = 'npc', onComplete) {
                if (typingIndicatorEl) chatWindowEl.removeChild(typingIndicatorEl);
                typingIndicatorEl = document.createElement('div');
                typingIndicatorEl.className = 'typing-cursor p-2';
                typingIndicatorEl.textContent = `${sender} está digitando`;
                chatWindowEl.appendChild(typingIndicatorEl);
                chatWindowEl.scrollTop = chatWindowEl.scrollHeight;

                if (!colLeft.classList.contains('column-blurred')) {
                    chatTitleEl.classList.add('chat-unread-pulse');
                    chatWindowEl.addEventListener('mouseenter', () => chatTitleEl.classList.remove('chat-unread-pulse'), { once: true });
                }

                const typingTime = gameState.inTutorial ? message.length * 60 + 500 : message.length * 30 + 500;
                
                setTimeout(() => {
                    if (typingIndicatorEl) {
                        try { chatWindowEl.removeChild(typingIndicatorEl); } catch (e) {}
                        typingIndicatorEl = null;
                    }
                    displayChatMessage(sender, message, type);
                    if (onComplete) onComplete();
                }, typingTime);
            }
            
            function displayChatMessage(sender, message, type = 'npc') {
                const msgEl = document.createElement('div');
                let senderClass = 'font-bold text-red-600';
                if (type === 'system') senderClass = 'font-bold text-blue-600';
                
                msgEl.innerHTML = `<span class="${senderClass} block text-xs mb-0.5">${sender}</span> <span class="text-gray-800 bg-white inline-block p-2 rounded-lg rounded-tl-none shadow-sm border border-gray-100">${message}</span>`;
                chatWindowEl.appendChild(msgEl);
                chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
                
                if (audioInitialized && sounds.chat) {
                    sounds.chat.triggerAttackRelease("A4", "16n", Tone.now() + 0.1);
                    sounds.chat.triggerAttackRelease("C5", "16n", Tone.now() + 0.2);
                }
            }
            
            function displayChatDivider(dayNumber) {
                const divEl = document.createElement('div');
                divEl.className = 'chat-divider';
                divEl.textContent = `Início do Dia ${dayNumber}`;
                chatWindowEl.appendChild(divEl);
                chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
            }

            function addChatMessage(sender, message, type = 'npc', onComplete) {
                if (gameState.currentDay > 1 || gameState.inTutorial) {
                    typeChatMessage(sender, message, type, onComplete);
                } else {
                    displayChatMessage(sender, message, type);
                    if (onComplete) onComplete();
                }
            }

            function selectTicket(ticketId) {
                if (gameState.processing) return;
                
                const ticket = TICKET_DATA[gameState.currentDay].find(t => t.id === ticketId);
                if (!ticket) return;
                
                gameState.currentTicket = ticket;
                renderTicket(ticket);
                
                stopTimer();
                if(gameState.pressureMessageTimerId) clearTimeout(gameState.pressureMessageTimerId);
                
                const timeForDay = DAY_TIMERS[gameState.currentDay];
                if (timeForDay > 0) startTimer(timeForDay);
                
                const pressureMsg = PRESSURE_MESSAGES[ticket.id];
                if (pressureMsg && !gameState.inTutorial) {
                    gameState.pressureMessageTimerId = setTimeout(() => {
                        addChatMessage(ticket.solicitante, pressureMsg, 'npc');
                    }, 5000);
                }
            }

            function renderTicket(ticket) {
                const createField = (label, value, fieldId = null) => {
                    const val = (value === null || value === undefined) ? '' : value;
                    let valDisplay = val === '' ? '[Vazio]' : val;
                    
                    let emptyClass = (val === '') ? 'ticket-field-empty' : '';
                    let dataAttr = fieldId ? `data-field="${fieldId}"` : '';
                    let fieldClass = fieldId ? 'ticket-field rounded-md -mx-2 px-2 py-1' : 'py-1';
                    
                    return `
                        <div class="${fieldClass}" ${dataAttr}>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">${label}</label>
                            <div class="text-base text-gray-800 font-medium ${emptyClass}">${valDisplay}</div>
                        </div>
                    `;
                };

                currentTicketEl.classList.remove('slide-out');
                
                currentTicketEl.innerHTML = `
                    <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                        <h3 class="text-3xl font-black text-gray-800 tracking-tight">${ticket.id}</h3>
                        <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${ticket.type === 'Incidente' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}">
                            ${ticket.type}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                        ${createField('Solicitante', ticket.solicitante, 'solicitante')}
                        ${createField('Departamento', ticket.depto, 'depto')}
                        
                        ${ticket.type === 'Incidente' ?
                            `
                            ${createField('Urgência', ticket.urgencia, 'urgencia')}
                            ${createField('Impacto', ticket.impacto, 'impacto')}
                            ` : `
                            ${createField('Nível de Risco', ticket.risco, 'risco')}
                            ${createField('Ativo Afetado', ticket.ativo, 'ativo')}
                            `
                        }
                    </div>
                    
                    <div class="border-t border-gray-100 pt-4 mt-4">
                        ${createField('Descrição', ticket.descricao)}
                    </div>
                    
                    ${ticket.type === 'Mudança' ?
                        `
                        <div class="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-x-8 bg-gray-50 p-3 rounded-lg">
                            ${createField('Plano de Rollback', ticket.rollback, 'rollback')}
                            ${createField('Assinatura', ticket.assinatura, 'assinatura')}
                        </div>
                        ` : ''
                    }
                `;
            }

            function processDecision(decision) {
                if (gameState.processing || !gameState.currentTicket) return;
                
                stopTimer();
                if(gameState.pressureMessageTimerId) clearTimeout(gameState.pressureMessageTimerId);
                
                if (gameState.inTutorial) {
                    if (decision === 'approve') {
                        gameState.inTutorial = false;
                        gameState.tutorialStep = 0;
                        clearAllFocusPulses();
                        console.log("Tutorial Concluído.");
                    } else {
                        return;
                    }
                }
                
                gameState.processing = true;
                const ticket = gameState.currentTicket;
                
                let errors = [...(ticket.errors || [])];
                
                if (PERSONNEL_DETAILS[ticket.solicitante]) {
                    if (PERSONNEL_DETAILS[ticket.solicitante].depto !== ticket.depto) {
                        if (!errors.includes('DEPT_MISMATCH')) errors.push('DEPT_MISMATCH');
                    }
                }
                
                if (ticket.ativo && ASSETS.baixo.includes(ticket.ativo) && ticket.risco !== 'Baixo') {
                    if (!errors.includes('RISK_LOGIC_VIOLATION')) errors.push('RISK_LOGIC_VIOLATION');
                }
                
                if (gameState.currentDay >= 4 && ticket.type === 'Mudança') {
                    const ativoRiscoAlto = ASSETS.alto.includes(ticket.ativo);
                    if (ativoRiscoAlto && ticket.risco !== 'Alto') {
                        if (!errors.includes('ASSET_RISCO_ALTO')) errors.push('ASSET_RISCO_ALTO');
                    }
                }

                if (gameState.currentDay >= 5 && ticket.type === 'Mudança') {
                    const isCab = STAFF.cab.includes(ticket.assinatura);
                    const isL1 = STAFF.l1.includes(ticket.assinatura);
                    if (ticket.risco === 'Alto' && !isCab) {
                        if (!errors.includes('INVALID_SIGNATURE')) errors.push('INVALID_SIGNATURE');
                    }
                    if (ticket.risco === 'Médio' && !isCab) {
                        if (!errors.includes('INVALID_SIGNATURE')) errors.push('INVALID_SIGNATURE');
                    }
                    if (ticket.risco === 'Baixo' && !isL1) {
                         if(isCab && !errors.includes('INVALID_SIGNATURE_L1')) errors.push('INVALID_SIGNATURE_L1');
                         else if (!isL1 && !errors.includes('INVALID_SIGNATURE')) errors.push('INVALID_SIGNATURE');
                    }
                }
                
                const hasErrors = errors.length > 0;
                let isCorrect = false;

                if (decision === 'approve' && !hasErrors) isCorrect = true;
                else if (decision === 'reject' && hasErrors) isCorrect = true;
                else if (decision === 'approve' && hasErrors) isCorrect = false;
                else if (decision === 'reject' && !hasErrors) isCorrect = false;
                
                gameState.ticketsProcessed++;
                
                // Lógica de Erro e Glitch
                if (!isCorrect) {
                    gameState.errorsCommitted++;
                    gameState.streak = 0; // Reset streak
                    currentTicketEl.classList.remove('streak-glow');
                    triggerGlitch(); // Gatilho do Glitch
                } else {
                    // Lógica de Streak
                    gameState.streak++;
                    if (gameState.streak >= 3) {
                        currentTicketEl.classList.add('streak-glow');
                    }
                }

                if (isCorrect) {
                    showFeedback(true, decision);
                } else {
                    const errorKey = errors[0] || 'GENERIC_ERROR';
                    let errorMsg = "Decisão incorreta.";
                    switch(errorKey) {
                        case 'MISSING_IMPACTO':
                        case 'MISSING_URGENCIA':
                        case 'MISSING_SOLICITANTE': errorMsg = "⚠ ALERTA DE INSTABILIDADE: DADOS INCOMPLETOS ⚠"; break;
                        case 'MISSING_ROLLBACK': errorMsg = "⚠ ALERTA DE INSTABILIDADE: ROLLBACK AUSENTE ⚠"; break;
                        case 'DEPT_MISMATCH': errorMsg = "⚠ ALERTA DE INSTABILIDADE: DADOS INCONGRUENTES ⚠"; break;
                        case 'RISK_LOGIC_VIOLATION': errorMsg = "⚠ ALERTA DE INSTABILIDADE: LÓGICA DE RISCO INVÁLIDA ⚠"; break;
                        case 'ASSET_RISCO_ALTO': errorMsg = "⚠ ALERTA DE INSTABILIDADE: ATIVO CRÍTICO EXPOSTO ⚠"; break;
                        case 'INVALID_SIGNATURE': errorMsg = "⚠ ALERTA DE INSTABILIDADE: ASSINATURA INVÁLIDA ⚠"; break;
                        case 'INVALID_SIGNATURE_L1': errorMsg = "⚠ ALERTA DE INSTABILIDADE: HIERARQUIA DE ASSINATURA INCORRETA ⚠"; break;
                    }
                    if (decision === 'reject' && !hasErrors) errorMsg = "⚠ ALERTA DE INSTABILIDADE: FALSO POSITIVO DETECTADO ⚠";
                    showFeedback(false, decision, errorMsg);
                }

                setTimeout(() => loadNextTicket(), isCorrect ? 1200 : 2500);
            }
            
            function triggerGlitch() {
                // Visual
                gameContainer.classList.add('system-glitch');
                setTimeout(() => gameContainer.classList.remove('system-glitch'), 200);
                
                // Audio
                if (audioInitialized && sounds.static) {
                    sounds.static.triggerAttackRelease("16n", Tone.now());
                }
            }
            
            function showFeedback(isCorrect, decision, message = "") {
                if (isCorrect) {
                    // Som de Sucesso com Pitch Shift baseado no Streak
                    let pitchNote = "C2";
                    if (gameState.streak >= 3) pitchNote = "G2"; // Streak 3+
                    if (gameState.streak >= 6) pitchNote = "C3"; // Streak 6+
                    
                    if (sounds.stamp) sounds.stamp.triggerAttackRelease(pitchNote, "8n", Tone.now());
                    
                    watermarkTextEl.textContent = (decision === 'approve') ? 'APROVADO' : 'REJEITADO';
                    watermarkTextEl.className = `text-9xl font-black opacity-10 ${decision === 'approve' ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'} border-4 p-4 rounded-xl transform rotate-[-12deg]`;
                    watermarkEl.classList.add('show');
                    feedbackMessageEl.textContent = (decision === 'approve') ? 'Aprovado Corretamente.' : 'Rejeitado Corretamente.';
                    feedbackMessageEl.className = 'h-14 p-2 text-center font-bold text-green-600 bg-green-50 w-full rounded-lg border border-green-200';
                } else {
                    if (sounds.reject) sounds.reject.triggerAttackRelease("2n", Tone.now() + 0.05);
                    // Não precisa de screen-shake aqui pois o glitch já faz isso visualmente melhor
                    feedbackMessageEl.textContent = message;
                    feedbackMessageEl.className = 'h-14 p-2 text-center font-bold text-red-600 bg-red-50 w-full rounded-lg border border-red-200';
                }
            }

            function loadNextTicket() {
                stopTimer();
                if(gameState.pressureMessageTimerId) clearTimeout(gameState.pressureMessageTimerId);
                
                gameState.currentTimeInMinutes += gameState.minutesPerTicket;
                updateClockDisplay();
                
                currentTicketEl.classList.add('slide-out');
                
                setTimeout(() => {
                    watermarkEl.classList.remove('show');
                    feedbackMessageEl.textContent = '';
                    feedbackMessageEl.className = 'h-14 p-2 text-center font-bold rounded-lg transition-colors duration-300';
                    gameState.processing = false;
                    gameState.currentTicket = null;
                    
                    gameState.ticketsInQueue.shift();
                    renderQueue();
                    
                    if (gameState.ticketsInQueue.length === 0) {
                        currentTicketEl.innerHTML = `<div class="text-center text-gray-500 p-8">Fim do dia. Processando...</div>`;
                        setTimeout(() => showEndOfDayReport(), 1500);
                    } else {
                        selectTicket(gameState.ticketsInQueue[0].id);
                        if (gameState.currentDay === 6 && gameState.ticketsInQueue.length === 1) {
                             setTimeout(() => addChatMessage(TICKET_DATA[6][5].solicitante, PRESSURE_MESSAGES['RFC-2017'], 'npc'), 5000);
                        }
                    }
                }, 400);
            }

            function showEndOfDayReport() {
                stopTimer();
                // Reset streak visual at end of day
                currentTicketEl.classList.remove('streak-glow'); 
                
                document.getElementById('eod-day-title').textContent = `Relatório do Dia ${gameState.currentDay}`;
                document.getElementById('eod-tickets').textContent = gameState.ticketsProcessed;
                document.getElementById('eod-errors').textContent = gameState.errorsCommitted;
                
                gameState.totalErrorsAcrossWeek += gameState.errorsCommitted;
                
                let supervisorComment = "Bom trabalho.";
                if (gameState.errorsCommitted > 2) supervisorComment = "Isso foi... abaixo do ideal. Muitos erros. A IA vai aprender com eles.";
                else if (gameState.errorsCommitted > 0) supervisorComment = "Alguns deslizes, mas no geral foi bem. Precisamos de 100% de precisão.";
                else supervisorComment = "Perfeito. É exatamente essa precisão que o sistema precisa.";
                
                if (gameState.currentDay === 6 && gameState.errorsCommitted > 1) supervisorComment = "Você cedeu à pressão? Ou foi lento demais? De qualquer forma, a IA aprendeu com seus erros.";
                else if (gameState.currentDay === 6 && gameState.errorsCommitted === 0) supervisorComment = "Impressionante. Rápido, preciso e não cedeu à pressão. Excelente.";
                
                document.getElementById('eod-comment').textContent = `"${supervisorComment}"`;
                
                eodReportEl.classList.remove('hidden');
                eodReportEl.style.opacity = '0';
                
                setTimeout(() => {
                    gameContainer.style.filter = 'blur(8px)';
                    eodReportEl.style.opacity = '1';
                    eodContentEl.style.transform = 'scale(1)';
                }, 10);
            }

            function hideEndOfDayReportAndLoadNext() {
                gameContainer.style.filter = 'none';
                eodReportEl.style.opacity = '0';
                eodContentEl.style.transform = 'scale(0.95)';
                eodReportEl.classList.add('hidden');

                const nextDay = gameState.currentDay + 1;
                gameState.ticketsProcessed = 0;
                gameState.errorsCommitted = 0;
                
                loadDay(nextDay);
            }
            
            function startTimer(totalTime) {
                stopTimer();
                gameState.timeLeft = totalTime;
                gameState.totalTime = totalTime;
                timerBarContainer.classList.add('visible');
                updateTimerBar();
                
                gameState.timerId = setInterval(() => {
                    gameState.timeLeft--;
                    updateTimerBar();
                    if (gameState.timeLeft <= 0) onTimeUp();
                }, 1000);
            }
            
            function stopTimer() {
                if (gameState.timerId) {
                    clearInterval(gameState.timerId);
                    gameState.timerId = null;
                }
                timerBarContainer.classList.remove('visible');
            }
            
            function updateTimerBar() {
                const percentage = (gameState.timeLeft / gameState.totalTime) * 100;
                timerBar.style.width = `${percentage}%`;
                timerBar.classList.remove('warning', 'danger');
                if (percentage < 25) timerBar.classList.add('danger');
                else if (percentage < 50) timerBar.classList.add('warning');
            }
            
            function onTimeUp() {
                stopTimer();
                if (gameState.processing) return;
                console.log("TEMPO ESGOTADO!");
                gameState.processing = true;
                gameState.errorsCommitted++;
                gameState.ticketsProcessed++;
                
                // Erro por tempo = Reset Streak e Glitch
                gameState.streak = 0;
                currentTicketEl.classList.remove('streak-glow');
                triggerGlitch();

                showFeedback(false, 'reject', "⚠ ALERTA DE INSTABILIDADE: TIMEOUT DO SISTEMA ⚠");
                addChatMessage('Supervisor', "Você demorou demais! Tive que intervir para não atrasar o hospital. Isso conta como um erro.", 'system');
                setTimeout(() => loadNextTicket(), 2500);
            }
            
            function updateClockDisplay() {
                const baseTime = new Date();
                baseTime.setHours(8, 0, 0, 0); 
                baseTime.setMinutes(baseTime.getMinutes() + gameState.currentTimeInMinutes);

                let hours = baseTime.getHours();
                let minutes = baseTime.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; 
                minutes = Math.floor(minutes); 
                minutes = minutes < 10 ? '0' + minutes : minutes;
                gameTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
            }

            function setColumnFocus(left, center, right) {
                colLeft.classList.toggle('column-blurred', !left);
                colCenter.classList.toggle('column-blurred', !center);
                colRight.classList.toggle('column-blurred', !right);
            }

            function clearAllFocusPulses() {
                document.querySelectorAll('.focus-pulse, .focus-pulse-buttons, .tab-pulse').forEach(el => el.classList.remove('focus-pulse', 'focus-pulse-buttons', 'tab-pulse'));
            }

            function runTutorialStep(step) {
                gameState.tutorialStep = step;
                console.log("Tutorial Step:", step);

                switch (step) {
                    case 1:
                        setColumnFocus(true, false, false);
                        const introMessages = [
                            "Bem-vindo. O hospital está implementando um 'Sistema de Decisão Automatizada' (SDA).",
                            "Suas decisões esta semana serão usadas para 'treinar' a IA. Basicamente, você é o algoritmo.",
                            "Siga o Manual de Regras da ISO 20000. Seus erros hoje serão os erros da máquina amanhã.",
                            "Vamos começar."
                        ];
                        typeTutorialMessages(introMessages, () => runTutorialStep(2));
                        break;
                    case 2:
                        addChatMessage('Supervisor', "Primeiro, clique no primeiro ticket da sua fila (RI-1001) para analisá-lo.", 'system');
                        queueTitleEl.classList.add('focus-pulse');
                        renderQueue();
                        const firstTicketEl = ticketQueueEl.querySelector('[data-ticket-id]');
                        if (firstTicketEl) {
                            firstTicketEl.addEventListener('click', () => {
                                if (gameState.tutorialStep !== 2) return;
                                selectTicket(firstTicketEl.dataset.ticketId);
                                clearAllFocusPulses();
                                runTutorialStep(3);
                            }, { once: true });
                        }
                        break;
                    case 3:
                        setColumnFocus(false, true, false);
                        setTimeout(() => runTutorialStep(4), 3000); 
                        break;
                    case 4:
                        setColumnFocus(true, true, true); 
                        addChatMessage('Supervisor', "Ótimo. Agora, verifique o Manual de Regras para ver se o ticket está correto.", 'system', () => {
                            rulesTabButton.classList.add('tab-pulse');
                            const firstRule = rulesContentEl.querySelector('li');
                            if (firstRule) firstRule.classList.add('focus-pulse');
                            setTimeout(() => {
                                clearAllFocusPulses();
                                runTutorialStep(5);
                            }, 3000);
                        });
                        break;
                    case 5:
                        setColumnFocus(true, true, true);
                        addChatMessage('Supervisor', "Este ticket está correto. Aperte o botão verde 'APROVAR' para processá-lo.", 'system');
                        actionButtonsEl.classList.add('focus-pulse-buttons');
                        break;
                }
            }
            
            function typeTutorialMessages(messages, onAllComplete) {
                let index = 0;
                function nextMessage() {
                    if (index < messages.length) {
                        addChatMessage('Supervisor', messages[index], 'system', nextMessage);
                        index++;
                    } else {
                        onAllComplete();
                    }
                }
                nextMessage();
            }

            function setupEventListeners() {
                kbTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        if (gameState.inTutorial && gameState.tutorialStep < 4) return;
                        const targetTab = tab.dataset.tab;
                        if (targetTab === 'regras') {
                            const indicator = rulesTabButton.querySelector('.new-rule-indicator');
                            if (indicator) indicator.remove();
                        }
                        kbTabs.forEach(t => { t.classList.remove('active', 'bg-eef2ff', 'text-indigo-600'); t.classList.add('text-gray-500'); });
                        tab.classList.add('active', 'bg-eef2ff', 'text-indigo-600');
                        tab.classList.remove('text-gray-500');
                        kbTabContents.forEach(c => c.classList.add('hidden'));
                        document.getElementById(`tab-content-${targetTab}`).classList.remove('hidden');
                    });
                });

                ticketQueueEl.addEventListener('click', (e) => {
                    if (gameState.inTutorial && gameState.tutorialStep !== 2) return;
                    if (gameState.processing) return;

                    const ticketEl = e.target.closest('[data-ticket-id]');
                    if (ticketEl) {
                        if (!gameState.inTutorial) {
                            document.querySelectorAll('#ticket-queue [data-ticket-id]').forEach(el => {
                                el.classList.remove('bg-blue-100', 'border-blue-300');
                                el.classList.add('bg-white');
                            });
                            ticketEl.classList.remove('bg-white');
                            ticketEl.classList.add('bg-blue-100', 'border-blue-300');
                            selectTicket(ticketEl.dataset.ticketId);
                        }
                    }
                });

                approveBtn.addEventListener('click', () => processDecision('approve'));
                rejectBtn.addEventListener('click', () => { if (gameState.inTutorial) return; processDecision('reject'); });
                eodNextDayBtn.addEventListener('click', hideEndOfDayReportAndLoadNext);
                endGameRestartBtn.addEventListener('click', () => location.reload());
                
                currentTicketEl.addEventListener('click', (e) => {
                    if (gameState.inTutorial) return;
                    const fieldEl = e.target.closest('[data-field]');
                    if (fieldEl) {
                        const field = fieldEl.dataset.field;
                        let tabToPulse = '';
                        if (field === 'assinatura' || field === 'solicitante' || field === 'depto') tabToPulse = 'pessoal';
                        if (field === 'ativo') tabToPulse = 'ativos';
                        if (field === 'rollback' || field === 'risco' || field === 'urgencia' || field === 'impacto') tabToPulse = 'regras';
                        
                        if (tabToPulse) {
                            const tabButton = document.querySelector(`.tab-button[data-tab='${tabToPulse}']`);
                            if (tabButton) {
                                tabButton.click();
                                tabButton.classList.add('tab-pulse');
                                setTimeout(() => tabButton.classList.remove('tab-pulse'), 1200);
                            }
                        }
                    }
                });
            }
            
            function setupGlossaryTooltips(container) {
                container.querySelectorAll('.tooltip[data-term]').forEach(el => {
                    const term = el.dataset.term;
                    if (!GLOSSARY[term]) return;
                    if (!el.querySelector('.tooltip-text')) {
                        const tooltipText = document.createElement('span');
                        tooltipText.className = 'tooltip-text';
                        tooltipText.textContent = GLOSSARY[term];
                        el.appendChild(tooltipText);
                    }
                    el.addEventListener('mouseenter', () => {
                        if (!gameState.discoveredTerms.has(term)) {
                            gameState.discoveredTerms.add(term);
                            updateGlossaryUI();
                        }
                    }, { once: true });
                });
            }

            function updateGlossaryUI() {
                if (gameState.discoveredTerms.size === 0) {
                      glossaryContentEl.innerHTML = `<div class="text-sm text-gray-500 text-center py-4 italic">Termos serão adicionados aqui conforme você os descobre.</div>`;
                    return;
                }
                glossaryContentEl.innerHTML = '';
                Array.from(gameState.discoveredTerms).sort().forEach(term => {
                    const entry = document.createElement('div');
                    entry.innerHTML = `<dt class="font-bold text-blue-600 text-xs uppercase mb-1">${term}</dt><dd class="text-xs text-gray-600 ml-2 border-l-2 border-blue-100 pl-2 leading-relaxed">${GLOSSARY[term]}</dd>`;
                    glossaryContentEl.appendChild(entry);
                });
            }
        });