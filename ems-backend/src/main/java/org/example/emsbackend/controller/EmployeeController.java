package org.example.emsbackend.controller;

import org.example.emsbackend.entity.Employee;
import org.example.emsbackend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<Employee> getAll() {
        return employeeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id) {
        return employeeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee create(@RequestBody Employee employee) {
        return employeeService.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee employee) {
        return employeeService.findById(id)
                .map(existing -> {
                    employee.setId(id);
                    return ResponseEntity.ok(employeeService.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
