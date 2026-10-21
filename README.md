# DollLink

O DollLink é um agregador de links pessoais com estética gótica: reúna suas redes sociais e outros links em uma única página de perfil personalizável. Edite nome, aparência e links no painel e acompanhe as alterações na prévia ao lado. O projeto é feito com HTML, CSS e JavaScript, sem framework ou etapa de compilação.

## Como executar

1. Baixe ou clone este repositório.
2. Abra `index.html` em um navegador moderno. Para uma origem local consistente entre o painel e o perfil, também é possível iniciar um servidor estático na pasta do projeto:

   ```bash
   python -m http.server 8000
   ```

   Em seguida, acesse `http://localhost:8000`.
3. Edite as opções no painel. A prévia é atualizada automaticamente.
4. Para visualizar o perfil sem o painel, clique em **ABRIR PÁGINA PÚBLICA**.

Não é necessário instalar dependências. Se preferir, sirva a pasta com um servidor HTTP estático. Mantenha o painel e o perfil na mesma origem para que possam compartilhar as configurações.

## Recursos

- Personalização de nome, descrição, localização, fontes, cores, opacidade e desfoque.
- Efeitos animados para o nome e o fundo.
- Upload ou URL para imagem de fundo, avatar, cursor e áudio.
- Agregação de links para redes sociais: Discord, Instagram, TikTok, X, Pinterest, Snapchat, YouTube, Spotify, GitHub, Twitch, Telegram e Reddit.
- Opções visuais para brilho, gradiente, ícones, badges e controles de áudio.
- Prévia sincronizada entre o painel e a página do perfil.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Painel de personalização e prévia do perfil. |
| `app.js` | Controles do painel, uploads e gravação das configurações. |
| `profile.html` | Página do perfil. |
| `profile.js` | Aplica as configurações e animações ao perfil. |
| `common.js` | Configurações padrão, fontes, redes sociais e funções de armazenamento compartilhadas. |
| `style.css` | Estilos do painel. |
| `profile.css` | Estilos do perfil. |

## Armazenamento e observações

- As configurações são guardadas no `localStorage` do navegador, na chave `dolllink`. Elas ficam no navegador e dispositivo usados; não existe backend para publicar ou sincronizar perfis entre usuários.
- Imagens e cursores enviados são armazenados como dados locais. Arquivos grandes podem exceder o limite de armazenamento do navegador; nesse caso, use uma URL.
- O áudio enviado usa uma URL temporária e não permanece disponível depois que a aba do painel é fechada. Para áudio persistente, use uma URL.
- O navegador pode bloquear a reprodução automática de áudio. Se isso acontecer, clique na página do perfil para ativá-la.
- Fontes do Google Fonts e ícones do Simple Icons são carregados de serviços externos e podem não aparecer sem conexão com a internet.
- A opção de avatar do Discord usa um avatar genérico de incorporação; não busca automaticamente a conta do usuário.
