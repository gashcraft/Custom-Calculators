var CUSTOMCALCULATOR = {
	// Version 2.0 AKA "This one actually (will) work"
	
    apiVersion: 1,
    calculate: function (auditResult, calculatorService) {
        
        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

		//--------
        // Our custom Score is points earned divided by questions answered.
        //	so for a perfect result (4 pts/ question, 11 questions, 44 pts)
        //	the score is 4.0.
        //--------

        this.calculatorService = calculatorService;
        this.auditScoreSets = {
            questionCount: 0,
            pointCount: 0
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category, this.auditScoreSets);
            }
        }
        
        // Set the overall score
        var newOverallScore = 0;
        if (this.auditScoreSets.questionCount > 0) {
        	newOverallScore = this.auditScoreSets.pointCount / this.auditScoreSets.questionCount;
        }
        result.score.percentage = newOverallScore;
        
        return result;
    },
    /**
     * calculateCategory - calculate an audit category or subcategory
     * the category/subcategory score is a single formula based on all questions within the category.
     * category/subcategory with name 'Product Code Info' will not be included in scoring.
     * each question look at selected choice and points earned. each category has a total of 100 points
     * Use standard whole integer rounding e.g. 76.5% = 77%
     * @param category - the category to calculate.
     */
    calculateCategory: function (category, auditScoreSets) {
        var myAuditScoreSets = {
            questionCount: 0,
            pointCount: 0
        };
        // Collect questions and points for this category
        if (category.questions) {
        	var questions = category.questions;
            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer && question.reference !== 'Bf3AFC') {
                    var answer = this.calculatorService.getQuestionResponse(question);
                    if (answer && typeof answer.earned === 'number') {
                        if (answer.possible > 0) {
                        	myAuditScoreSets.pointCount += answer.earned;
                        	myAuditScoreSets.questionCount += 1;
                    	}
                  	}
                }
            }
        }
        // Process subcategory for questions and points
		if (category.categories) {
			for (var sub = 0, sublen = category.categories.length; sub < sublen; sub++) {
				var subcategory = category.categories[sub];
				this.calculateCategory(subcategory, myAuditScoreSets);
			}
		}
        
		// Calculate score for the category; include (any) child questions and points
		//	Only set a percentage if questions existed.
		//	Otherwise no percentage attribute will exist.
        if (myAuditScoreSets.questionCount > 0) {
        	category.score.percentage = myAuditScoreSets.pointCount / myAuditScoreSets.questionCount;
        }

        // Rollup collected questions & points for overall scoring
        auditScoreSets.questionCount += myAuditScoreSets.questionCount;
        auditScoreSets.pointCount += myAuditScoreSets.pointCount;
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /*
    * auditScoreSets - custom score values for custom calculations
    */
    auditScoreSets: {
        questionCount: 0,
        pointCount: 0
    }
   
};
