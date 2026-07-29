FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/finance-service /src/services/finance-service
WORKDIR /src/services/finance-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/finance-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/finance-service /finance-service
EXPOSE 8102
ENTRYPOINT ["/finance-service"]
