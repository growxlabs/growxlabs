FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/hr-service /src/services/hr-service
WORKDIR /src/services/hr-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/hr-service ./cmd/server
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/hr-service /hr-service
EXPOSE 8103
ENTRYPOINT ["/hr-service"]
