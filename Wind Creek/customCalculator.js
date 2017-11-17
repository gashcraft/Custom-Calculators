var CUSTOMCALCULATOR = {
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        var scoredResult = calculatorService.calculateStandardScore(auditResult);

        var testQuestionsAnswered = 0;
        var questionsNotAnswered = "";
        if (scoredResult.categories) {
            for (var categoryIndex = 0; categoryIndex < scoredResult.categories.length; categoryIndex++) {
                if (scoredResult.categories[categoryIndex].questions) {
                    for (var questionIndex = 0; questionIndex < scoredResult.categories[categoryIndex].questions.length; questionIndex++) {
                        if (calculatorService.isQuestionAnswered(scoredResult.categories[categoryIndex].questions[questionIndex])) {
                            testQuestionsAnswered++;
                        } else {
                            questionsNotAnswered += scoredResult.categories[categoryIndex].questions[questionIndex].reference + "; ";
                        }
                    }
                }
            }
        }

        var text = "total questions answered = " + testQuestionsAnswered + ". Questions not answered = " + questionsNotAnswered;
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