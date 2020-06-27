export const titleMaxSize = 60
export const responseMaxSize = 30
export const contentMaxSize = 1000
export const maxNumberOfQuestions = 4
export const trimmedResponses = responses => {
	const trimmed = responses.map((r, i) => r.trim())
	return trimmed.filter(r => r.length > 0)
}

export const iterator = number => {
    const a = [];
    let i = 0;
    for (i = 0; i < number; i++) {
      a.push(i);
    }
    return a;
  };