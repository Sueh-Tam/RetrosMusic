# 🎵 RetrosMusic — Roadmap & Funcionalidades

> Um player de músicas com alma analógica, trazendo a nostalgia do áudio físico para a era digital.

---

## 🎯 Visão Geral do Projeto

O **RetrosMusic** é um aplicativo mobile de reprodução de músicas que reimagina a experiência auditiva através de uma imersão visual e sonora retrô. O diferencial do app não é apenas tocar música — é transportar o usuário de volta às décadas de ouro do áudio físico, combinando estética analógica com a conveniência do streaming moderno.

O app integra reprodução de arquivos locais, streaming via YouTube e um sistema de download offline, tudo embrulhado em uma identidade visual que simula hardware clássico como fitas K7, Mini Discs e players da era Winamp.

---

## 🗺️ Módulos do Projeto

- [1. Identidade Visual e Experiência Retrô (UI/UX)](#1-identidade-visual-e-experiência-retrô-uiux)
- [2. Core do Player de Música](#2-core-do-player-de-música)
- [3. Integração com YouTube](#3-integração-com-youtube)
- [4. Sistema de Download por Link (Offline)](#4-sistema-de-download-por-link-offline)
- [5. Configurações e Extras](#5-configurações-e-extras)
- [6. Tema Fita K7 — Detalhamento Técnico](#6-tema-fita-k7--detalhamento-técnico)

---

## Legenda de Status

| Badge | Significado |
|---|---|
| 🔴 Não iniciado | A funcionalidade ainda não foi planejada para desenvolvimento imediato |
| 🟡 Em desenvolvimento | A funcionalidade está sendo ativamente construída |
| 🟢 Desenvolvido | A funcionalidade está completa e integrada ao app |

---

## 1. Identidade Visual e Experiência Retrô (UI/UX)

> O grande diferencial do RetrosMusic é a imersão visual total. O design simula hardware analógico e players clássicos da era de ouro do áudio digital, criando uma experiência única que vai além de simplesmente tocar uma música.

### 1.1 Temas Visuais Clássicos

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Tema Fita K7 (Cassette)** | Interface principal com fitas que giram conforme a música toca, incluindo efeito de "desgaste" opcional e etiquetas totalmente editáveis. O rolo de origem vai diminuindo enquanto o de destino cresce, proporcionalmente ao progresso da faixa. | 🔴 Não iniciado |
| **Tema Mini Disc / CD Player Portátil** | Visor LCD com luz de fundo âmbar/verde e animações de leitura de disco, simulando os portáteis da Sony dos anos 90/2000. | 🔴 Não iniciado |
| **Tema Winamp / 90s Media Player** | Visual industrial com equalizador gráfico de ponteiros ou barras no estilo dos clássicos players de PC, com janelas arrastáveis e estética "skin". | 🔴 Não iniciado |
| **Seletor de Temas** | Painel de configurações para alternar entre os temas visuais disponíveis em tempo real. | 🔴 Não iniciado |

### 1.2 Feedback Tátil e Sonoro (Haptics & SFX)

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Sons Mecânicos nos Botões** | Efeitos sonoros ao apertar Play, Pause, Stop e demais controles, incluindo o clássico clique metálico da fita K7. | 🔴 Não iniciado |
| **Sons de Avanço/Retrocesso Rápido** | Reprodução do som característico de fita rebobinando ao usar FF/REW. | 🔴 Não iniciado |
| **Vibração Háptica** | Vibração sutil e diferenciada para cada ação, simulando o feedback mecânico de engrenagens físicas. | 🔴 Não iniciado |

### 1.3 Modo Colecionador (Tela Cheia)

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Modo Tela Cheia Imersivo** | Interface minimalista focada exclusivamente no player retrô ativo, ocultando elementos de navegação e maximizando a imersão visual. | 🔴 Não iniciado |

---

## 2. Core do Player de Música

> O motor de áudio do RetrosMusic precisa ser robusto o suficiente para gerenciar tanto arquivos locais quanto fluxos de streaming, mantendo uma experiência fluida e sem interrupções.

### 2.1 Reprodução e Controles

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Controles Analógicos Simulados** | Botões físicos virtualizados para Play/Pause, Avançar e Retroceder faixa, com animação de depressão física ao toque. | 🔴 Não iniciado |
| **Barra de Progresso Retrô** | Indicador de progresso estilizado conforme o tema ativo (ex: comprimento da fita nos rolos no tema K7). | 🔴 Não iniciado |
| **Controle de Volume** | Slider de volume com visual analógico (potenciômetro giratório ou slider físico). | 🔴 Não iniciado |

### 2.2 Gerenciamento de Fila e Playlists

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Criação de Playlists Locais** | Permite ao usuário criar, nomear e organizar coleções de músicas locais. No tema K7, são exibidas como "caixinhas de fita empilhadas". | 🔴 Não iniciado |
| **Ordenação da Fila** | Opções para reordenar manualmente as faixas da fila de reprodução. | 🔴 Não iniciado |
| **Modo Loop** | Repetição da faixa atual ou de toda a playlist. | 🔴 Não iniciado |
| **Modo Shuffle** | Reprodução aleatória das faixas com animação de embaralhamento temática. | 🔴 Não iniciado |

### 2.3 Equalizador Gráfico

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Equalizador de 5 a 10 Bandas** | Controle granular das frequências de áudio com sliders analógicos no estilo de equalizers físicos. | 🔴 Não iniciado |
| **Presets Retrô** | Configurações pré-definidas temáticas: *Rock*, *Pop*, *Bass Boost*, *Acoustic*, *Tape Warmth*, entre outros. | 🔴 Não iniciado |
| **Visualizador de Espectro** | Barras ou ponteiros animados que respondem ao áudio em tempo real, integrados ao visual do tema ativo. | 🔴 Não iniciado |

### 2.4 Letras Sincronizadas

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Exibição de Letras** | Painéis de letras sincronizadas no estilo "Karaokê antigo" ou com visual de papel amassado, remetendo aos encartes físicos de CDs e K7s. | 🔴 Não iniciado |
| **Busca Automática de Letras** | O app busca automaticamente a letra da faixa em reprodução via API externa. | 🔴 Não iniciado |

---

## 3. Integração com YouTube

> O RetrosMusic permite que o usuário encontre e reproduza músicas diretamente do YouTube sem precisar sair do app, com uma experiência de busca fluida e totalmente integrada à estética retrô.

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Busca Integrada** | Campo de pesquisa temático conectado à API do YouTube para buscar músicas, clipes, álbuns completos ou playlists. | 🔴 Não iniciado |
| **Player de Streaming In-App** | Reprodução do áudio do YouTube diretamente dentro do RetrosMusic, sem redirecionar para outro aplicativo. | 🔴 Não iniciado |
| **Modo Fundo (Background Play)** | Capacidade de continuar reproduzindo o áudio do YouTube mesmo com a tela bloqueada ou enquanto o usuário usa outros aplicativos. | 🔴 Não iniciado |
| **Extração de Áudio em Tempo Real** | Conversão otimizada do fluxo de vídeo para reprodução contínua de áudio puro, reduzindo o consumo de dados móveis. | 🔴 Não iniciado |
| **Histórico de Reprodução** | Registro das faixas do YouTube reproduzidas recentemente, acessível em formato de "lista de fitas usadas". | 🔴 Não iniciado |

---

## 4. Sistema de Download por Link (Offline)

> A ferramenta para transformar qualquer link do YouTube em uma faixa permanente no acervo retrô do usuário. Baixar uma música vira um ritual — como gravar uma fita em casa.

### 4.1 Colagem Inteligente de Link

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Detecção Automática de Link** | O app detecta automaticamente quando um link do YouTube é copiado para a área de transferência e exibe uma sugestão de download imediata. | 🟢 Desenvolvido |
| **Botão Flutuante de Download** | Botão de gravação/download acessível no deck e no rodapé do app para colar links e gravar fitas. | 🟢 Desenvolvido |

### 4.2 Metadados Automáticos

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Extração Automática de Metadados** | O sistema busca automaticamente via oEmbed a capa do vídeo, nome do artista e título da música para organizar a fita na biblioteca. | 🟢 Desenvolvido |
| **Editor Manual de Metadados** | Interface para o usuário personalizar capa, título e artista caso queira adaptar a "capa do álbum" ou o nome da faixa ao gosto pessoal. | 🔴 Não iniciado |
| **J-Card da Fita K7** | A arte e metadados extraídos são exibidos na etiqueta manuscrita da fita K7 com corpo temático (Type I / Type II). | 🟢 Desenvolvido |

### 4.3 Gerenciador de Downloads

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Painel de Progresso Retrô** | Barra de status com animação de Fita Virgem sendo gravada, roletes em rotação em tempo real e indicador vermelho de REC piscando. | 🟢 Desenvolvido |
| **Seleção de Qualidade de Áudio** | Opção de escolher entre alta qualidade (MP3/M4A 320kbps) ou modo de economia de espaço. | 🔴 Não iniciado |
| **Fila de Downloads** | Gerenciamento de múltiplos downloads simultâneos ou em fila, com opção de cancelar, pausar e retomar. | 🔴 Não iniciado |

---

## 5. Configurações e Extras

### 5.1 Biblioteca Offline

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Seção de Músicas Baixadas** | Tela dedicada ("Minhas Fitas") para gerenciar, pesquisar e reproduzir todas as faixas salvas localmente. | 🟢 Desenvolvido |
| **Organização por Artista/Álbum** | Filtros e busca em tempo real na estante de fitas por Artista ou Nome da Faixa. | 🟢 Desenvolvido |
| **Visualização em "Caixinhas de Fita"** | Estante retrô de fitas K7 com lombadas coloridas, tipo de fita, tamanho do arquivo e ação de tocar/apagar fita. | 🟢 Desenvolvido |

### 5.2 Armazenamento

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Seleção de Destino de Download** | Opção para mover os downloads para o cartão SD externo ou para o armazenamento interno. | 🔴 Não iniciado |
| **Limite de Cache** | Definição de um tamanho máximo de cache para o app gerenciar automaticamente o espaço ocupado. | 🔴 Não iniciado |

### 5.3 Performance e Bateria

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Modo Economia de Bateria** | Reduz automaticamente (ou sob demanda) as animações pesadas — como os rolos girando da fita K7 — quando a bateria do dispositivo está em nível crítico. | 🔴 Não iniciado |

---

## 6. Tema Fita K7 — Detalhamento Técnico

> Este módulo descreve em profundidade o comportamento, as animações e os elementos visuais que compõem o tema principal do RetrosMusic: a Fita K7.

### 6.1 Animação Dinâmica dos Rolinhos (Reels)

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Velocidade Proporcional dos Rolos** | O rolo da esquerda (origem) começa cheio e diminui conforme a música avança; o rolo da direita (destino) começa pequeno e vai acumulando fita, mapeado diretamente no progresso da faixa (0% a 100%). | 🔴 Não iniciado |
| **Rotação no Play** | Os rolinhos começam a girar suavemente ao pressionar Play. | 🔴 Não iniciado |
| **Travamento no Pause** | Os rolinhos travam instantaneamente ao pausar, como em uma fita real. | 🔴 Não iniciado |
| **Animação de FF/REW** | Os rolinhos giram em alta velocidade no sentido correspondente ao avançar ou retroceder, acompanhados de som de fita rebobinando. | 🔴 Não iniciado |
| **Tape Flutter/Wobble** | Pequenas imperfeições sutis no movimento dos rolos para dar uma sensação mecânica e orgânica realista. | 🔴 Não iniciado |

### 6.2 Personalização do Cassete

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Etiqueta Personalizada (Label)** | O título da música e o nome do artista são exibidos na etiqueta central da fita, com fontes no estilo manuscrito, esferográfica ou impressora matricial/datilográfica. | 🔴 Não iniciado |
| **Skin Type I (Ferro/Básica)** | Fita com plástico escuro tradicional e janela transparente central, estilo clássico anos 70/80. | 🔴 Não iniciado |
| **Skin Type II (Cromo)** | Estilo anos 80/90 com corpo transparente esfumaçado ou acrílico colorido (azul neon, vermelho, amarelo clássico). | 🔴 Não iniciado |
| **Skin Custom/Edição Limitada** | Fitas com visual de grafite, bandas de metal, estética Synthwave ou designs exclusivos. | 🔴 Não iniciado |

### 6.3 Controles do Deck de Cassete

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Painel de Botões Analógicos** | Botões salientes e metálicos virtuais de Record, Play, Rewind, Fast-Forward, Stop/Eject e Pause na área inferior da tela. | 🔴 Não iniciado |
| **Animação de Depressão Física** | Ao pressionar, os botões animam uma depressão física com feedback sonoro de clique metálico (Click/Thud). | 🔴 Não iniciado |

### 6.4 Filtros de Áudio Vintage (Opcionais)

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Tape Hiss (Chiado de Fita)** | Um ruído de fundo rosa/branco leve e opcional que simula a reprodução de fita magnética analógica. | 🔴 Não iniciado |
| **Lo-Fi / Pitch Wobble** | Efeito opcional de variação sutil de afinação analógica, simulando as imperfeições do motor de uma fita real. | 🔴 Não iniciado |

### 6.5 Telas e Transições Temáticas

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Tela de Reprodução (Deck View)** | Tela principal com a fita K7 centralizada e o painel de botões do deck na parte inferior. | 🔴 Não iniciado |
| **Menu de Ejeção / Biblioteca** | Ao pressionar Eject, uma animação de porta abrindo é exibida, a fita "sai" do deck e a biblioteca de músicas abre em formato de caixinhas de fita empilhadas. | 🔴 Não iniciado |
| **Tela de Download/Gravação** | Ao colar um link do YouTube, o app exibe a animação de uma Fita Virgem sendo "gravada" com um indicador vermelho de REC piscando em tempo real. | 🔴 Não iniciado |

---

## 📊 Resumo Geral de Progresso

| Módulo | Total | 🟢 Desenvolvido | 🟡 Em Desenvolvimento | 🔴 Não Iniciado |
|---|---|---|---|---|
| Identidade Visual (UI/UX) | 8 | 0 | 0 | 8 |
| Core do Player | 11 | 0 | 0 | 11 |
| Integração YouTube | 5 | 0 | 0 | 5 |
| Download por Link | 7 | 4 | 0 | 3 |
| Configurações e Extras | 5 | 3 | 0 | 2 |
| Tema K7 — Detalhamento | 14 | 0 | 0 | 14 |
| **Total Geral** | **50** | **7** | **0** | **43** |

---

## 📅 Próximos Passos Sugeridos

1. **Definir a stack tecnológica** — Expo SDK, biblioteca de áudio (expo-av ou react-native-track-player), engine de animações (Reanimated 3 ou Skia).
2. **Configurar o projeto base** — Estrutura de pastas, Expo Router, design system e tokens de cores dos temas.
3. **Implementar o Core do Player** — Motor de áudio funcional antes de qualquer camada visual.
4. **Construir o Tema K7** — Animações dos rolos, painel de botões e telas de transição.
5. **Integrar o YouTube** — API de busca e streaming com background play.
6. **Implementar o sistema de Download** — Detecção de clipboard, extração de metadados e gerenciador de fila.

---

*Documento gerado em: Outubro de 2026 — Sujeito a revisões conforme o desenvolvimento avança.*
