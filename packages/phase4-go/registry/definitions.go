package registry

import "growx/commandcenter/phase4/contract"

type Tool contract.ToolDefinition

func (d Tool) RegistryID() string                { return d.ID }
func (d Tool) RegistryVersion() string           { return d.Version }
func (d Tool) RegistryStatus() string            { return d.Status }
func (d Tool) Contract() contract.ToolDefinition { return contract.ToolDefinition(d) }

type Capability contract.CapabilityDefinition

func (d Capability) RegistryID() string                      { return d.ID }
func (d Capability) RegistryVersion() string                 { return d.Version }
func (d Capability) RegistryStatus() string                  { return d.Status }
func (d Capability) Contract() contract.CapabilityDefinition { return contract.CapabilityDefinition(d) }

type Skill contract.SkillDefinition

func (d Skill) RegistryID() string                 { return d.ID }
func (d Skill) RegistryVersion() string            { return d.Version }
func (d Skill) RegistryStatus() string             { return d.Status }
func (d Skill) Contract() contract.SkillDefinition { return contract.SkillDefinition(d) }
