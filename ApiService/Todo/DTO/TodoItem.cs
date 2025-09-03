namespace ApiService.DataParser.DTO;

public class ParsedDataItem
{
    public int Id { get; set; }
    public string? OriginalInput { get; set; }
    public string? ParsedJson { get; set; }
    public double Confidence { get; set; }
    public DateTime CreatedAt { get; set; }
}
