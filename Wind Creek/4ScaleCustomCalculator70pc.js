var CUSTOMCALCULATOR = {
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
    
        var newOverallScore = 70;

        auditResult.score.percentage = newOverallScore;
        
        return auditResult;
    }
};
