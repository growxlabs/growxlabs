FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY services/internal-api-gateway /src/services/internal-api-gateway
WORKDIR /src/services/internal-api-gateway
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/internal-api-gateway ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/internal-api-gateway /internal-api-gateway
EXPOSE 8097
ENTRYPOINT ["/internal-api-gateway"]
