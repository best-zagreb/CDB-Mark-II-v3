package com.example.backend.collaborations.service;

import com.example.backend.collaborations.model.Collaboration;
import com.example.backend.collaborations.model.CollaborationId;
import com.example.backend.collaborations.repo.CollaborationsRepository;
import com.example.backend.companies.model.Company;
import com.example.backend.companies.model.Contact;
import com.example.backend.companies.repo.CompanyRepository;
import com.example.backend.companies.repo.ContactRepository;
import com.example.backend.project.controller.dto.CollaborationDTO;
import com.example.backend.project.model.Project;
import com.example.backend.project.repo.ProjectRepository;
import com.example.backend.user.model.AUTHORITY;
import com.example.backend.user.model.AppUser;
import com.example.backend.user.repo.UserRepository;
import com.example.backend.util.exceptions.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class CollaborationsService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final CollaborationsRepository collaborationsRepository;
    private final ContactRepository contactRepository;


    public List<Collaboration> getCollaborationsForCompany(Long id) {
        if (companyRepository.findById(id).isEmpty()) throw new javax.persistence.EntityNotFoundException();
        return collaborationsRepository.findAllByCollaborationId_Company(companyRepository.findById(id).get());
    }

    public Collaboration addCollaboration(Long projectid, CollaborationDTO collaborationDTO, AppUser user) throws AuthenticationException, ProjectNotFoundException, CompanyNotFoundException, ContactNotFoundException, EntityNotFoundException {
        if (user == null) throw new AuthenticationException();

        Project project;
        if (projectRepository.findById(projectid).isPresent()) project = projectRepository.findById(projectid).get();
        else throw new ProjectNotFoundException();
        Company company;
        if (companyRepository.findById(collaborationDTO.getCompanyId()).isPresent()) company = companyRepository.findById(collaborationDTO.getCompanyId()).get();
        else throw new CompanyNotFoundException();
        Contact contact;
        if (contactRepository.findById(collaborationDTO.getContactId()).isPresent()) contact = contactRepository.findById(collaborationDTO.getContactId()).get();
        else throw new ContactNotFoundException();
        AppUser contactResp;
        if (userRepository.findById(collaborationDTO.getContactResponsibleId()).isPresent()) contactResp = userRepository.findById(collaborationDTO.getContactResponsibleId()).get();
        else throw new EntityNotFoundException();

        if (user.getAuthority() == AUTHORITY.OBSERVER || user.getAuthority() == AUTHORITY.FR_TEAM_MEMBER ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && !Objects.equals(project.getFRResp().getId(), user.getId())))
            throw new AuthenticationException();

        Collaboration collaboration = new Collaboration(
                new CollaborationId(project, company),
                contact,
                contactResp,
                collaborationDTO.isPriority(),
                collaborationDTO.getCategory(),
                collaborationDTO.getStatus(),
                collaborationDTO.getComment(),
                collaborationDTO.getAchievedValue()
        );

        return collaborationsRepository.save(collaboration);
    }

    public Collaboration updateCollaboration(Long projectId, Long companyId, CollaborationDTO collaborationDTO, AppUser user) throws AuthenticationException, ProjectNotFoundException, CompanyNotFoundException, CollaborationNotFoundException, EntityNotFoundException, ContactNotFoundException {
        if (user == null) throw new AuthenticationException();

        CollaborationId collaborationId;
        if (projectRepository.findById(projectId).isPresent() && companyRepository.findById(companyId).isPresent()){
            collaborationId = new CollaborationId(projectRepository.findById(projectId).get(), companyRepository.findById(companyId).get());
        } else if (projectRepository.findById(projectId).isEmpty()){
            throw new ProjectNotFoundException();
        } else throw new CompanyNotFoundException();

        Collaboration collaboration;
        if (collaborationsRepository.findById(collaborationId).isPresent()) {
            collaboration = collaborationsRepository.findById(collaborationId).get();
        } else throw new CollaborationNotFoundException();

        if (userRepository.findById(collaborationDTO.getContactResponsibleId()).isPresent()) collaboration.setContactResponsible(userRepository.findById(collaborationDTO.getContactResponsibleId()).get());
        else throw new EntityNotFoundException();
        if (contactRepository.findById(collaborationDTO.getContactId()).isPresent()) collaboration.setContact(contactRepository.findById(collaborationDTO.getContactId()).get());
        else throw new ContactNotFoundException();
        collaboration.setPriority(collaborationDTO.isPriority());
        collaboration.setCategories(collaborationDTO.getCategory());
        collaboration.setStatus(collaborationDTO.getStatus());
        collaboration.setComment(collaborationDTO.getComment());
        collaboration.setAchievedValue(collaborationDTO.getAchievedValue());

        return collaborationsRepository.save(collaboration);
    }

    public void deleteCollaboration(Long projectId, Long companyId, AppUser user) throws AuthenticationException, ProjectNotFoundException, CompanyNotFoundException {
        if (user == null) throw new AuthenticationException();

        Project project;
        if (projectRepository.findById(projectId).isPresent()) project = projectRepository.findById(projectId).get();
        else throw new ProjectNotFoundException();
        Company company;
        if (companyRepository.findById(companyId).isPresent()) company = companyRepository.findById(companyId).get();
        else throw new CompanyNotFoundException();
        if (user.getAuthority() == AUTHORITY.OBSERVER ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && !Objects.equals(project.getFRResp().getId(), user.getId()))) {
                throw new AuthenticationException();
        }

        CollaborationId collaborationId = new CollaborationId(project, company);
        collaborationsRepository.deleteById(collaborationId);
    }

    public Collaboration getCollaborationByCollaborationId(Long projectid, Long companyid) {
        return collaborationsRepository.findById(new CollaborationId(projectRepository.findById(projectid).get(), companyRepository.findById(companyid).get())).get();
    }
}
