# ETAPA 1: Construir a aplicação (Build)
FROM node:20-alpine as builder

WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copia o resto do código fonte
COPY . .

# Roda o comando de build do Vite (isso vai gerar a pasta /app/dist)
RUN npm run build


# ETAPA 2: Servir com Nginx
FROM nginx:alpine

# Remove o index.html padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia a pasta 'dist' gerada na Etapa 1 para a pasta pública do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# O professor pediu para testar na porta 8080 (Opcional, mas recomendado para evitar conflitos locais)
# O Nginx expõe a porta 80 por padrão. Se quiser mudar a configuração interna para 8080, 
# teríamos que injetar um arquivo de configuração nginx.conf. 
# O jeito mais fácil é expor a 80 aqui e mapear para a 8080 no docker-compose.
EXPOSE 80

# Comando padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]