namespace Data;

public class DataParserDbContext(DbContextOptions<DataParserDbContext> options) : DbContext(options)
{
    public DbSet<ParsedData> ParsedDataEntries => Set<ParsedData>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<ParsedData>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OriginalInput).HasMaxLength(1000);
            entity.Property(e => e.ParsedJson).HasMaxLength(4000);
            entity.HasIndex(e => e.CreatedAt);
        });
    }
}
