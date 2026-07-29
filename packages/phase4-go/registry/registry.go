package registry

import (
	"errors"
	"fmt"
	"sort"
	"sync"
)

var (
	ErrNotFound = errors.New("definition not found")
	ErrDisabled = errors.New("definition is disabled")
)

type Versioned interface {
	RegistryID() string
	RegistryVersion() string
	RegistryStatus() string
}

type Registry[T Versioned] struct {
	mu      sync.RWMutex
	entries map[string]map[string]T
}

func New[T Versioned]() *Registry[T] {
	return &Registry[T]{entries: make(map[string]map[string]T)}
}

func (r *Registry[T]) Register(definition T) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	id, version := definition.RegistryID(), definition.RegistryVersion()
	if id == "" || version == "" {
		return errors.New("definition ID and version are required")
	}
	versions := r.entries[id]
	if versions == nil {
		versions = make(map[string]T)
		r.entries[id] = versions
	}
	if _, exists := versions[version]; exists {
		return fmt.Errorf("duplicate definition %s@%s", id, version)
	}
	versions[version] = definition
	return nil
}

func (r *Registry[T]) Get(id, version string, allowDeprecated bool) (T, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var zero T
	versions := r.entries[id]
	if len(versions) == 0 {
		return zero, ErrNotFound
	}
	if version != "" {
		definition, ok := versions[version]
		if !ok {
			return zero, ErrNotFound
		}
		return permitted(definition, allowDeprecated)
	}
	keys := make([]string, 0, len(versions))
	for key := range versions {
		keys = append(keys, key)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(keys)))
	for _, key := range keys {
		if versions[key].RegistryStatus() == "active" {
			return versions[key], nil
		}
	}
	return zero, ErrDisabled
}

func permitted[T Versioned](definition T, allowDeprecated bool) (T, error) {
	var zero T
	switch definition.RegistryStatus() {
	case "active":
		return definition, nil
	case "deprecated":
		if allowDeprecated {
			return definition, nil
		}
		return zero, ErrDisabled
	default:
		return zero, ErrDisabled
	}
}
