package com.example.backend.companies.controller;
import com.example.backend.companies.controller.dto.CompanyDto;
import com.example.backend.companies.controller.dto.ContactDto;
import com.example.backend.companies.model.Company;
import com.example.backend.companies.model.Contact;
import com.example.backend.companies.service.CompanyService;
import com.example.backend.user.model.AppUser;
import com.example.backend.user.service.UserService;
import com.example.backend.util.JwtVerifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.naming.AuthenticationException;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/companies")
public class CompanyController
{
    private final CompanyService companyService;
    private final UserService userService;

    public CompanyController(CompanyService companyService, UserService userService)
    {
        this.companyService = companyService;
        this.userService = userService;
    }

    @GetMapping
    @ResponseBody
    public ResponseEntity<List<Company>> getCompanies(@RequestHeader String googleTokenEncoded){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.getAllCompanies(user), HttpStatus.OK);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping
    @ResponseBody
    public ResponseEntity<Company> AddCompany(@RequestHeader String googleTokenEncoded, @RequestBody CompanyDto companyDto){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.createCompany(user, companyDto), HttpStatus.CREATED);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Company> getCompany(@RequestHeader String googleTokenEncoded, @PathVariable Long id){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.getCompany(user, id), HttpStatus.OK);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("{companyId}/contacts")
    @ResponseBody
    public ResponseEntity<Contact> addContact(@RequestHeader String googleTokenEncoded, @PathVariable Long companyId, @RequestBody ContactDto contactDto){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.addContactToCompany(user, companyId, contactDto), HttpStatus.OK);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PutMapping("{companyId}")
    @ResponseBody
    public ResponseEntity<Company> editCompany(@RequestHeader String googleTokenEncoded, @PathVariable Long companyId, @RequestBody CompanyDto companyDto){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.editCompany(user, companyId, companyDto), HttpStatus.OK);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @DeleteMapping("{companyId}")
    @ResponseBody
    public ResponseEntity<Company> deleteCompany(@RequestHeader String googleTokenEncoded, @PathVariable Long companyId)
    {
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            companyService.deleteCompany(user, companyId);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("{companyId}/contacts/{contactId}")
    @ResponseBody
    public ResponseEntity<Contact> editContact(@RequestHeader String googleTokenEncoded, @PathVariable Long companyId, @PathVariable Long contactId, @RequestBody ContactDto contactDto){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            return new ResponseEntity<>(companyService.editContact(user, companyId, contactId, contactDto), HttpStatus.OK);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @DeleteMapping("{companyId}/contacts/{contactId}")
    @ResponseBody
    public ResponseEntity deleteContact(@RequestHeader String googleTokenEncoded, @PathVariable Long companyId, @PathVariable Long contactId, @RequestBody ContactDto contactDto){
        AppUser user = getUser(googleTokenEncoded);
        try
        {
            companyService.deleteContact(user, companyId, contactId);
        } catch (AuthenticationException e)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private AppUser getUser(String googleTokenEncoded){
        String email = JwtVerifier.verifyAndReturnEmail(googleTokenEncoded);
        if (email == null)
            return null;
        return userService.findByEmail(email);
    }
}