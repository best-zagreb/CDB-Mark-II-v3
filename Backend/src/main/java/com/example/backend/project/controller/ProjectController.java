package com.example.backend.project.controller;

import com.example.backend.collaborations.repo.CollaborationsRepository;
import com.example.backend.collaborations.service.CollaborationsService;
import com.example.backend.project.controller.dpo.FRTeamMemberDPO;
import com.example.backend.project.controller.dpo.ProjectAndFRTeamMembersDPO;
import com.example.backend.project.controller.dto.CollaborationDTO;
import com.example.backend.project.controller.dto.ProjectDTO;
import com.example.backend.project.model.Project;
import com.example.backend.project.service.ProjectService;
import com.example.backend.user.model.AUTHORITY;
import com.example.backend.user.model.AppUser;
import com.example.backend.user.service.UserService;
import com.example.backend.util.JwtVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@SuppressWarnings("ALL")
@CrossOrigin
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final UserService userService;
    private final CollaborationsService collaborationsService;

    @GetMapping()
    @ResponseBody
    public ResponseEntity getAllProjects(@RequestHeader String googleTokenEncoded){
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);

        return new ResponseEntity(projectService.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity getProjectById(@RequestHeader String googleTokenEncoded, @PathVariable Long id){
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);

        Project project = projectService.findById(id);
        Set<FRTeamMemberDPO> frTeamMemberDPOSet = new HashSet<>();
        for (AppUser appUser: project.getFrteammembers()){ //iterating through project's FR team members to extract id, first and last name
            FRTeamMemberDPO x = new FRTeamMemberDPO(
                    appUser.getId(),
                    appUser.getFirstName(),
                    appUser.getLastName()
            );
            frTeamMemberDPOSet.add(x);
        }

        ProjectAndFRTeamMembersDPO projectAndFRTeamMembersDPO = new ProjectAndFRTeamMembersDPO(
                project.getId(),
                project.getIdCreator(),
                project.getName(),
                project.getCategory(),
                project.getType(),
                project.getStartDate(),
                project.getEndDate(),
                project.getFRResp(),
                project.getFRGoal(),
                project.getFirstPingDate(),
                project.getSecondPingDate(),
                frTeamMemberDPOSet
        );

        return new ResponseEntity(projectAndFRTeamMembersDPO, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity addProject(@RequestHeader String googleTokenEncoded, @RequestBody ProjectDTO projectDTO){
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        if (!a.contains(userService.findByEmail(email).getAuthority()))
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);

        return new ResponseEntity(projectService.addProject(projectDTO), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateProject(@RequestHeader String googleTokenEncoded, @RequestBody ProjectDTO projectDTO, @PathVariable Long id){
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        if (!a.contains(userService.findByEmail(email).getAuthority()))
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);

        return new ResponseEntity(projectService.updateProject(projectDTO, id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteProjects(@RequestHeader String googleTokenEncoded, @PathVariable Long id){
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        if (!a.contains(userService.findByEmail(email).getAuthority()))
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);

        return new ResponseEntity("Project under id: " + id + " Successfully deleted", HttpStatus.OK);
    }

    @GetMapping("/{id}/collaborations")
    public ResponseEntity getCollaborations(@RequestHeader String googleTokenEncoded, @PathVariable Long id){
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        AppUser user = userService.findByEmail(email);
        Project project = projectService.findById(id);
        if (user.getAuthority() == AUTHORITY.OBSERVER ||
                (user.getAuthority() == AUTHORITY.FR_TEAM_MEMBER && !project.getFrteammembers().contains(user)) ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && project.getFRResp() != user)) {
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity(projectService.getCollaborations(id), HttpStatus.OK);
    }

    @PostMapping("/{projectid}/collaborations")
    public ResponseEntity addCollaboration(@RequestHeader String googleTokenEncoded, @PathVariable Long projectid, @RequestBody CollaborationDTO collaborationDTO){
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        AppUser user = userService.findByEmail(email);
        Project project = projectService.findById(projectid);
        if (user.getAuthority() == AUTHORITY.OBSERVER ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && project.getFRResp() != user)) {
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity(collaborationsService.addCollaboration(projectid, collaborationDTO), HttpStatus.OK);
    }

    @PutMapping("/{projectid}/collaborations/{companyid}")
    public ResponseEntity addCollaboration(@RequestHeader String googleTokenEncoded, @PathVariable Long projectid,
                                           @PathVariable Long companyid, @RequestBody CollaborationDTO collaborationDTO) {
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        AppUser user = userService.findByEmail(email);
        Project project = projectService.findById(projectid);
        if (user.getAuthority() == AUTHORITY.OBSERVER ||
                (user.getAuthority() == AUTHORITY.FR_TEAM_MEMBER && collaborationsService.getContactRespByCollaboratonId(projectid, companyid) != user ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && project.getFRResp() != user))) {
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity(collaborationsService.updateCollaboration(projectid, companyid, collaborationDTO), HttpStatus.OK);
    }

    @DeleteMapping("/{projectid}/collaborations/{companyid}")
    public ResponseEntity deleteCollaboration(@RequestHeader String googleTokenEncoded, @PathVariable Long projectid,
                                           @PathVariable Long companyid, @RequestBody CollaborationDTO collaborationDTO) {
        List<AUTHORITY> a = List.of(AUTHORITY.MODERATOR, AUTHORITY.ADMIN);
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return new ResponseEntity("Token is missing or invalid", HttpStatus.UNAUTHORIZED);
        if (userService.findByEmail(email) == null)
            return new ResponseEntity("You don't have access to CDB", HttpStatus.UNAUTHORIZED);
        AppUser user = userService.findByEmail(email);
        Project project = projectService.findById(projectid);
        if (user.getAuthority() == AUTHORITY.OBSERVER ||
                (user.getAuthority() == AUTHORITY.FR_RESPONSIBLE && project.getFRResp() != user)) {
            return new ResponseEntity("You don't have premission to this resource", HttpStatus.UNAUTHORIZED);
        }

        collaborationsService.deleteCollaboration(projectid, companyid);
        return new ResponseEntity("Collaboration deleted successfully", HttpStatus.OK);
    }
}
