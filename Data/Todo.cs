
namespace Data;

public class ParsedData
{
    public int Id { get; set; }
    public string? OriginalInput { get; set; }
    public string? ParsedJson { get; set; }
    public double Confidence { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
