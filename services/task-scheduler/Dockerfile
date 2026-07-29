FROM golang:1.26-alpine AS build
WORKDIR /src/services/task-scheduler
COPY services/task-scheduler .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/task-scheduler ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/task-scheduler /task-scheduler
EXPOSE 8092
ENTRYPOINT ["/task-scheduler"]
