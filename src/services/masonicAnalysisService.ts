export interface CandidateAnalysis {
  synthesis: string;
  performanceTable: {
    category: string;
    score: 'A' | 'B' | 'C' | 'D';
    reason: string;
  }[];
  sindicanciaPoints: string[];
  finalParecer: string;
  profileType: 'A' | 'B' | 'C' | 'D';
}

export async function analyzeCandidate(formData: any): Promise<CandidateAnalysis> {
  try {
    const response = await fetch("/api/analyze-candidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData }),
    });

    if (!response.ok) {
      let errMsg = `AI analysis server returned status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errMsg = errorData.error;
        }
      } catch (e) {
        // use default error message if body is not JSON
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
}
