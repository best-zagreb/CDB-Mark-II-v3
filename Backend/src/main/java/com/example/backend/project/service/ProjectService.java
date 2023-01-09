package com.example.backend.project.service;

import com.example.backend.project.controller.dto.ProjectDTO;
import com.example.backend.project.model.Project;
import com.example.backend.project.repo.ProjectRepository;
import com.example.backend.user.repo.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service @Transactional
@AllArgsConstructor
public class ProjectService {
    private ProjectRepository projectRepository;
    private UserRepository userRepository;

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Optional<Project> findById(Long id) {
        return projectRepository.findById(id);
    }

    public Project addProject(ProjectDTO projectDTO) {
        Project project = new Project(
                projectDTO.getIdCreator(),
                projectDTO.getName(),
                projectDTO.getCategory(),
                projectDTO.getType(),
                projectDTO.getStartDate(),
                projectDTO.getEndDate(),
                userRepository.findById(projectDTO.getIdFRResp()).get(),
                new HashSet<>(),
                projectDTO.getFRgoal(),
                projectDTO.getFirstPingDate(),
                projectDTO.getSecondPingDate()
        );
        return projectRepository.save(project);
    }

    public Project updateProject(ProjectDTO projectDTO, Long id) {
        Project project = projectRepository.findById(id).get();

        project.setIdCreator(projectDTO.getIdCreator());
        project.setName(projectDTO.getName());
        project.setCategory(projectDTO.getCategory());
        project.setType(projectDTO.getType());
        project.setStartDate(projectDTO.getStartDate());
        project.setEndDate(projectDTO.getEndDate());
        project.setFRResp(userRepository.findById(projectDTO.getIdFRResp()).get());
        project.setFRGoal(projectDTO.getFRgoal());
        project.setFirstPingDate(projectDTO.getFirstPingDate());
        project.setSecondPingDate(projectDTO.getSecondPingDate());

        return projectRepository.save(project);
    }
}