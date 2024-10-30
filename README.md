# Projeto VALLPASS - Gestão Remota

## Estrutura diretórios e ficheiros (raíz)

- `/AplicacaoWeb` - aplicação Web React Material para administração do sistema VALLPASS
- `/DataModel` - diretório com os artefactos afetos ao modelos de dados inteligente para o sistema VALLPASS
- `/VolumesDocker` - diretório com alguns dos volumes necessários aos contentores Docker (mapeamento)
- `/Prototipagem` - diretório com os artefactos desenvolvidos para a prototipagem do sistema VALLPASS
- `docker-compose.yml` - ficheiro Docker Compose

## Docker Compose

### Antes de iniciar os contentores Docker

O diretório "VolumesDocker" já contém a maioria dos volumes necessários aos contentores Docker (mapeamento), todavia existe 1 volume - afeto ao serviço Nominatim - que terá de ser criado manualmente; para tal introduzir o seguinte comando Docker (em alternativa utilizar o Docker Desktop - GUI):

- `docker volume create Nominatim`

### Iniciar os contentores Docker

No diretório raíz do projeto executar o seguinte comando Docker:

- `docker compose -f "docker-compose.yml" up -d --build`
