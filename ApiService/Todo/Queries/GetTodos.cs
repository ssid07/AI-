namespace ApiService.DataParser.Queries;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Data;
using DTO;

public record GetParsedDataQuery : IRequest<IEnumerable<ParsedDataItem>>;

public class GetParsedDataQueryHandler(DataParserDbContext context) : IRequestHandler<GetParsedDataQuery, IEnumerable<ParsedDataItem>>
{
    public async Task<IEnumerable<ParsedDataItem>> Handle(GetParsedDataQuery request, CancellationToken cancellationToken)
    {
        return await context.ParsedDataEntries
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ParsedDataItem 
            { 
                Id = x.Id, 
                OriginalInput = x.OriginalInput, 
                ParsedJson = x.ParsedJson, 
                Confidence = x.Confidence,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
