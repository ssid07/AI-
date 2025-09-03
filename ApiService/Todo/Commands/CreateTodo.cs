namespace ApiService.DataParser.Commands;

using MediatR;
using Data;
using Python;
using Python.Models;
using System.Text.Json;

public record ParseDataCommand(string InputText) : IRequest<int>;

public class ParseDataHandler(DataParserDbContext context, PythonClient pythonClient) : IRequestHandler<ParseDataCommand, int>
{
    public async Task<int> Handle(ParseDataCommand request, CancellationToken cancellationToken)
    {
        string? parsedJson = null;
        double confidence = 0.0;
        
        try
        {
            if (!string.IsNullOrWhiteSpace(request.InputText))
            {
                var parseResult = await pythonClient.ParseData(request.InputText);
                var parsed = JsonSerializer.Deserialize<DataParseResult>(parseResult, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (parsed != null)
                {
                    parsedJson = JsonSerializer.Serialize(parsed.ParsedData);
                    confidence = parsed.Confidence;
                }
            }
        }
        catch
        {
            // If parsing fails, continue with null values
        }

        var entity = new ParsedData
        {
            OriginalInput = request.InputText,
            ParsedJson = parsedJson,
            Confidence = confidence,
            CreatedAt = DateTime.UtcNow
        };

        context.ParsedDataEntries.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
