namespace ApiService.Python.Models;

public record PersonalInfoResult(
    string? Name,
    string? Street,
    string? City,
    string? State,
    string? Country,
    string? ZipCode,
    string? PhoneNumber,
    string? Email,
    double Confidence
);

public record DataParseResult(
    string OriginalInput,
    PersonalInfoResult ParsedData,
    double Confidence
);

public record IdCardInfoResult(
    string? FullName,
    string? FirstName,
    string? LastName,
    string? DateOfBirth,
    string? IdNumber,
    string? LicenseNumber,
    string? Address,
    string? City,
    string? State,
    string? ZipCode,
    string? Country,
    string? IssueDate,
    string? ExpirationDate,
    string? Gender,
    string? Height,
    string? Weight,
    string? EyeColor,
    string? DocumentType,
    string? IssuingAuthority,
    double Confidence
);

public record IdCardResult(
    string Filename,
    IdCardInfoResult ParsedData,
    double Confidence
);