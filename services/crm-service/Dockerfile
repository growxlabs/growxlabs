FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/crm-service /src/services/crm-service
WORKDIR /src/services/crm-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/crm-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/crm-service /crm-service
EXPOSE 8101
ENTRYPOINT ["/crm-service"]
