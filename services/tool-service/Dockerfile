FROM golang:1.26-alpine AS build
WORKDIR /src
COPY packages/execution-go /src/packages/execution-go
COPY packages/phase4-go /src/packages/phase4-go
COPY services/tool-service /src/services/tool-service
WORKDIR /src/services/tool-service
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/tool-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/tool-service /tool-service
EXPOSE 8094
ENTRYPOINT ["/tool-service"]
