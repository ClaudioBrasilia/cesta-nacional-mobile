# Design do Cesta Nacional Mobile

## Direção do produto

O Cesta Nacional Mobile é um jogo de gestão de basquete brasileiro para celular, com partidas rápidas, elenco fictício e visual 2D esportivo. A primeira entrega será otimizada para Android, mas todas as decisões de navegação e componentes devem permanecer compatíveis com iOS.

A experiência deve seguir padrões de interface mobile de primeira linha: navegação inferior persistente, áreas de toque amplas, hierarquia visual clara, feedback imediato e uso confortável com uma mão em orientação portrait 9:16.

## Lista de telas

| Tela | Conteúdo e função principal |
|---|---|
| Início | Próximo jogo, campanha, moral do elenco, forma recente, alertas e acesso rápido à partida. |
| Elenco | Lista de jogadores fictícios, posições, energia, nota geral e titulares. |
| Perfil do jogador | Atributos, estilo, evolução, estatísticas da temporada e ação de definir titularidade. |
| Partida | Adversário, placar, período, energia, eventos e controles de estratégia. |
| Resultado | Placar final, destaques, desempenho dos jogadores, impacto na classificação e recompensas. |
| Mercado | Jogadores fictícios disponíveis, custo, posição, potencial e contratação. |
| Treinamento | Escolha do foco semanal: arremesso, defesa, físico, entrosamento ou jovens. |
| Classificação | Tabela da liga, calendário, campanha e próximos confrontos. |
| Central da Liga | Atualizações de balanceamento, novidades, desafios e notas da versão. |
| Configurações | Preferências, áudio, vibração, acessibilidade e reinício local da carreira. |

## Navegação principal

A navegação inferior terá quatro abas: **Início**, **Elenco**, **Liga** e **Mais**. A partida atual será destacada na tela inicial com um botão primário “Jogar partida”. Telas secundárias serão abertas por cartões e botões, evitando menus profundos.

## Fluxos principais

### Disputar uma partida

1. O usuário abre Início e toca em “Jogar partida”.
2. Visualiza adversário, dificuldade e comparação das equipes.
3. Confirma titulares e estratégia inicial.
4. A partida avança em momentos-chave, com opções de ritmo, defesa, ataque, substituição e tempo técnico.
5. O usuário recebe o resultado, os destaques e a atualização da classificação.
6. O jogo sugere treinamento ou consulta ao mercado.

### Gerenciar um jogador

1. O usuário abre Elenco.
2. Toca em um atleta fictício.
3. Visualiza atributos, posição, energia, forma e estilo.
4. Define titularidade ou reserva.
5. Volta ao elenco com a alteração refletida imediatamente.

### Contratar um reforço

1. O usuário abre Liga ou Mercado.
2. Filtra por posição, custo ou perfil.
3. Abre o perfil de um atleta.
4. Confirma a contratação se houver orçamento.
5. O atleta aparece no elenco e a folha salarial é atualizada.

### Consultar uma atualização

1. O usuário abre Central da Liga.
2. Visualiza a nota da atualização e as mudanças de balanceamento.
3. Consulta atletas em destaque e desafios temporários.
4. Retorna à carreira com o conteúdo aplicado localmente.

## Layout mobile portrait

A tela deve usar cartões verticais com margens laterais de 16 a 20 pontos. O cabeçalho terá o nome da equipe, reputação e orçamento. O conteúdo principal será rolável, enquanto ações essenciais ficarão em botões inferiores ou cartões de acesso rápido.

A área inferior deverá respeitar a barra de navegação do aparelho. Nenhum botão essencial deve ficar colado à borda inferior. Elementos interativos deverão ter áreas de toque confortáveis e estados visuais de pressionado.

## Identidade visual

A marca usará azul-marinho profundo como base, laranja de quadra como cor de ação e amarelo para destaques de vitória. O fundo será azul quase preto, com superfícies em azul petróleo e linhas finas inspiradas na marcação da quadra.

| Token | Cor | Uso |
|---|---|---|
| Azul quadra | #071A2B | Fundo principal e cabeçalho. |
| Azul petróleo | #102B40 | Cartões e superfícies. |
| Laranja cesta | #F47B20 | Botões primários e ações. |
| Amarelo vitória | #FFD166 | Destaques, estrelas e recompensas. |
| Branco placar | #F7FAFC | Texto principal. |
| Azul névoa | #A9C1D3 | Texto secundário. |
| Verde forma | #3DDC97 | Evolução e desempenho positivo. |
| Vermelho alerta | #F06A6A | Faltas, energia baixa e erros. |

## Direção das ilustrações

Os jogadores serão representados por cartas 2D com silhuetas e ilustrações originais. O estilo será esportivo, colorido e levemente caricatural, evitando semelhança direta com atletas reais. Clubes fictícios terão identidades regionais próprias, sem copiar escudos, uniformes ou marcas existentes.

## Tom de voz

A comunicação será curta, energética e clara, com linguagem de técnico e gestor. Exemplos: “Seu próximo desafio”, “Elenco em boa forma”, “Defesa ajustada” e “Novo talento disponível”.

## Acessibilidade

O projeto deve suportar texto legível, contraste alto, não depender apenas de cor para comunicar estados, reduzir animações quando necessário e manter os controles compreensíveis sem exigir conhecimento avançado de basquete.
