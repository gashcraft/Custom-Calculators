var CUSTOMCALCULATOR = {
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        var scoredResult = calculatorService.calculateStandardScore(auditResult);

        var testQuestionsAnswered = 0;
        var questionsNotAnswered = "";
        var text = "";
        if (scoredResult.categories) {
        	text += " scoredResult.categories=" + scoredResult.categories;
        	text += " scoredResult.categories.length=" + scoredResult.categories.length;
            for (var categoryIndex = 0; categoryIndex < scoredResult.categories.length; categoryIndex++) {
	        	text += " categoryIndex= " + categoryIndex;
	        	text += " scoredResult.categories[categoryIndex].questions= " + scoredResult.categories[categoryIndex].questions;
                if (scoredResult.categories[categoryIndex].questions) {
		        	text += " spot3 ";
                    for (var questionIndex = 0; questionIndex < scoredResult.categories[categoryIndex].questions.length; questionIndex++) {
			        	text += " spot4 ";
                        if (calculatorService.isQuestionAnswered(scoredResult.categories[categoryIndex].questions[questionIndex])) {
                            testQuestionsAnswered++;
                        } else {
                            questionsNotAnswered += scoredResult.categories[categoryIndex].questions[questionIndex].reference + "; ";
                        }
                    }
                }
            }
        }
        var newOverallScore = auditResult.score.pointsEarned / auditResult.score.questionCount;

        text += " total questions answered = " + testQuestionsAnswered + ". Questions not answered = " + questionsNotAnswered + ". auditResult.score.pointsEarned = " + auditResult.score.pointsEarned + ". auditResult.score.questionCount = " + auditResult.score.questionCount;

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