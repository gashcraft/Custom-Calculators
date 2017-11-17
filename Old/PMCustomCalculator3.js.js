var CUSTOMCALCULATOR = {
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        var scoredResult = calculatorService.calculateStandardScore(auditResult);
        
        var newOverallScore = auditResult.score.pointsEarned / auditResult.score.questionCount;
        scoredResult.score.percentage = newOverallScore;

		var text = "This is the PM Custom Calculator, new overall score " + newOverallScore;
        if (scoredResult.notes) {
            scoredResult.notes.text = text;
        } else {
            scoredResult.notes = {
                text: text
            };
        }
                
        return scoredResult;
    }
};
