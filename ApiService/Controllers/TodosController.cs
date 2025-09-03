namespace ApiService.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using DataParser.Commands;
using DataParser.Queries;
using DataParser.DTO;
using ApiService.Python;
using ApiService.Python.Models;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class DataParserController(IMediator mediator, PythonClient pythonClient) : ControllerBase
{
    [HttpGet(Name = nameof(GetParsedData))]
    public async Task<IEnumerable<ParsedDataItem>> GetParsedData()
    {
        return await mediator.Send(new GetParsedDataQuery());
    }

    [HttpPost(Name = nameof(ParseData))]
    public async Task<ActionResult<int>> ParseData(ParseDataRequest request)
    {
        return await mediator.Send(new ParseDataCommand(request.InputText));
    }

    [HttpPost("preview", Name = nameof(PreviewParse))]
    public async Task<IActionResult> PreviewParse([FromBody] ParseDataRequest request)
    {
        var result = await pythonClient.ParseData(request.InputText);
        var parsed = JsonSerializer.Deserialize<DataParseResult>(result, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        return Ok(parsed);
    }

    [HttpPost("idcard", Name = nameof(ParseIdCard))]
    public async Task<IActionResult> ParseIdCard(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (!file.ContentType.StartsWith("image/"))
        {
            return BadRequest("File must be an image");
        }

        const int maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.Length > maxFileSize)
        {
            return BadRequest("File too large. Maximum size is 10MB");
        }

        try
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            var result = await pythonClient.ParseIdCard(fileBytes, file.FileName);
            var parsed = JsonSerializer.Deserialize<IdCardResult>(result, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return Ok(parsed);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"ID card parsing failed: {ex.Message}");
        }
    }
}

public record ParseDataRequest(string InputText);
