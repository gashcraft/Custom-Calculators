var CUSTOMCALCULATOR = {
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        
        var newOverallScore = auditResult.score.pointsEarned / auditResult.score.questionCount;

        auditResult.score.percentage = newOverallScore;

        return auditResult;
    }
};
