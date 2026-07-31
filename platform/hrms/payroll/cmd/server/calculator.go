package main

import "math"

type SalaryCalculator struct{}

func NewSalaryCalculator() *SalaryCalculator {
	return &SalaryCalculator{}
}

type CalculationResult struct {
	GrossPay    float64
	PFEmployee  float64
	ESIEmployee float64
	IncomeTax   float64
	NetPay      float64
}

func (c *SalaryCalculator) CalculateMonthlySalary(basic, hra, special float64, pfEnabled, esiEnabled bool) CalculationResult {
	gross := basic + hra + special

	var pf float64
	if pfEnabled {
		pf = math.Min(basic, 15000.0) * 0.12
	}

	var esi float64
	if esiEnabled && gross <= 21000.0 {
		esi = gross * 0.0075
	}

	// Annual Tax Estimation
	annualGross := gross * 12.0
	var annualTax float64
	if annualGross > 700000.0 {
		annualTax = (annualGross - 700000.0) * 0.10
	}
	monthlyTax := annualTax / 12.0

	totalDeductions := pf + esi + monthlyTax
	net := gross - totalDeductions

	return CalculationResult{
		GrossPay:    math.Round(gross*100) / 100,
		PFEmployee:  math.Round(pf*100) / 100,
		ESIEmployee: math.Round(esi*100) / 100,
		IncomeTax:   math.Round(monthlyTax*100) / 100,
		NetPay:      math.Round(net*100) / 100,
	}
}
