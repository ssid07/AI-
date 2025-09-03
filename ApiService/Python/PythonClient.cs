using System.Text;
using System.Text.Json;

namespace ApiService.Python;

public class PythonClient(HttpClient httpClient)
{
    public async Task<string> ParseData(string inputText)
    {
        var request = new { input_text = inputText };
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await httpClient.PostAsync("/api/todos/classify", content);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> ParseIdCard(byte[] imageData, string fileName)
    {
        using var form = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(imageData);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        form.Add(fileContent, "file", fileName);

        var response = await httpClient.PostAsync("/api/idcard/parse", form);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}
