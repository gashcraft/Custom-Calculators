var CUSTOMCALCULATOR = {
    /**
     * apiVersion - helps the Score Service know which logic to use.
     */
    apiVersion: 1, // use version 1

    /**
     * calculate - required method that runs the custom calculate logic.
     * @param auditResult - existing AuditResult object.
     * @param calculatorService - toolbox methods and properties to assist in scoring.
     * @returns - audit result object after calculated logic.
     */
    calculate: function (auditResult, calculatorService) {
        // first it is a good idea to score the result with the standard calculator
        var result = calculatorService.calculateStandardScore(auditResult);
        var parentCategory = null;

        this.calculatorService = calculatorService;
        this.auditScores = {
            relevantQuestions: 0,
            relevantPoints: 0
        };

        if (result.categories) {
            for (var i = 0, len = result.categories.length; i < len; i++) {
                var category = result.categories[i];
                this.calculateCategory(category);

                if (category.categories) {
                    for (var sub = 0, sublen = category.categories.length; sub < sublen; sub++) {
                        var subcategory = category.categories[sub];
                        this.calculateCategory(subcategory);
                    }
                }

            }
        }

/** Diagnostic Code
        var text = "This is the PM Custom Calculator, new overall score test " + auditResult.score.percentage + " " + result.score.percentage;
        if (result.notes) {
            result.notes.text = text;
        } else {
            result.notes = {
                text: text
            };
        }
*/
		var finalScore = 0;
		if (this.auditScores.relevantQuestions > 0) {
			result = this.auditScores.relevantPoints / this.auditScores.relevantQuestions;
		};
		
        return finalScore;
    },

    /**
     * calculateCategory - calculate an audit category or subcategory
     * the category/subcategory score is a single formula based on all questions within the category.
     * category/subcategory with name 'Product Code Info' will not be included in scoring.
     * each question look at selected choice and points earned. each category has a total of 100 points
     * Use standard whole integer rounding e.g. 76.5% = 77%
     * @param category - the category to calculate.
     */
    calculateCategory: function (category) {
        if (category.label !== 'Product Code Info' && category.questions) {
            var score = null;
            var rollupScore = null;

            if (category.score) {
                score = category.score;
            }
            if (category.rollupScore) {
                rollupScore = category.rollupScore;
            }

            this.calculateCategoryScore(score, rollupScore, category.questions);
        }
    },

    /**
     * calculateOverall - calculate the overall audit score.
     * the overall score is a single formula based on all question scores not averages of category scores.
     * @param auditResult - the audit result to calculate.
     */
    calculateOverall: function (auditResult) {
        var score = null;
        var rollupScore = null;

        if (auditResult.score) {
            score = auditResult.score;
        }
        if (auditResult.rollupScore) {
            rollupScore = auditResult.rollupScore;
        }

        this.setCustomScoreValues(score, rollupScore, this.auditScoreSets);
    },

    /**
     * calculateCategoryScore - calculate category score based on questions given. this is the main category scoring logic.
     * @param score - the score object to change.
     * @param questions - the list of questions to score.
     */
    calculateCategoryScore: function (score, rollupScore, questions) {
        if (questions) {
            var totalEarnedPoints = 0;
            var categoryScoreSets = {
                numberOfQuestions: 0,
                numberOf100: 0,
                numberOf85: 0,
                numberOf60: 0,
                numberOf25: 0,
                numberOf0: 0
            };

            for (var i = 0, len = questions.length; i < len; i++) {
                var question = questions[i];
                if (question.answer && question.reference !== 'Bf3AFC') {
                    var answer = this.calculatorService.getQuestionResponse(question);
                    if (answer && typeof answer.earned === 'number') {
                        if (answer.possible > 0) {
                        	totalEarnedPoints += answer.earned;
                        	categoryScoreSets.numberOfQuestions += 1;
                        	switch (answer.earned) {
                            	case 100:
                                	categoryScoreSets.numberOf100 += 1;
                                	break;
								case 85:
									categoryScoreSets.numberOf85 += 1;
									break;
								case 60:
									categoryScoreSets.numberOf60 += 1;
									break;
								case 25:
									categoryScoreSets.numberOf25 += 1;
									break;
								case 0:
									categoryScoreSets.numberOf0 += 1;
									break;
								default:
							}
                    	}
                  	}
                }
            }

            this.setCustomScoreValues(score, rollupScore, categoryScoreSets);
            this.setCustomRollingResultValues(categoryScoreSets);
        }
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /*
    * auditScoreSets - custom score values for custom calculations
    */
    auditScores: {
        relevantQuestions: 0,
        relevantPoints: 0
    },

    /**
     * setCustomScoreValues - set the score values based on custom logic 
     * choice 5 = 100%
     * choices 4 or 6 = 85% + number of 5's/number of questions * 10%
     * choices 3 or 7 = 60% + number of 5's/number of questions * 20% + number of 4's and 6's/number of questions * 10%
     * choices 2 or 8 = 25%
     * choices 1 or 9 = 0% 
     * @param score - the score object to change.
     * @param scoreSets - custom aggregate values.
     */
    setCustomScoreValues: function (score, rollupScore, scoreSets) {
        var calculatedPercentage = score.percentage;
        var gotIt = false;

        if (scoreSets.numberOfQuestions > 1) {
            if (scoreSets.numberOf0 > 0) {
                calculatedPercentage = 0.0; // Base score
                gotIt = true;
            }

            if (!gotIt && (scoreSets.numberOf25 > 0)) {
                calculatedPercentage = 25.0; // Base score
                gotIt = true;
            }

            if (!gotIt && (scoreSets.numberOf60 > 0)) {
                calculatedPercentage = 60.0; // Base score
                if (scoreSets.numberOfQuestions > 1) { // Avoid divide by zero if only 1 question
					calculatedPercentage += ((scoreSets.numberOf100 / (scoreSets.numberOfQuestions - 1)) * 20); // Account for 5's
					calculatedPercentage += ((scoreSets.numberOf85 / (scoreSets.numberOfQuestions - 1)) * 10); // Account for 4's and 6's
                }
                gotIt = true;
            }

            if (!gotIt && (scoreSets.numberOf85 > 0)) {
                calculatedPercentage = 85.0; // Base score
                if (scoreSets.numberOfQuestions > 1) {  // Avoid divide by zero if only 1 question
                	calculatedPercentage += ((scoreSets.numberOf100 / (scoreSets.numberOfQuestions - 1)) * 10); // Account for 5's
                }
            }

            // No need to account for (scoreSets.numberOf100 > 0) because all we have are 5's if we got this far.
            // So, the score will already be 100%.
        }

        if (score && score.percentage) {
            score.percentage = calculatedPercentage;
        }
        if (rollupScore && rollupScore.percentage) {
            rollupScore.percentage = calculatedPercentage;
        }
    },

    /*
    * forcefullyUpdateParentCategory -
    * Sets the parent category percentage to be the same as the overall result percentage
    * @param categoryScoreSets - custom aggregate values.
    */
    forcefullyUpdateParentCategory: function (resultScore, categoryScore) {
        categoryScore.percentage = resultScore.percentage;
    },

    /*
    * setCustomRollingResultValues -
    * Sets the rolling aggregate csutom score values for the entire result
    * @param categoryScoreSets - custom aggregate values.
    */
    setCustomRollingResultValues: function (categoryScoreSets) {
        this.auditScoreSets.numberOfQuestions += categoryScoreSets.numberOfQuestions;
        this.auditScoreSets.numberOf0 += categoryScoreSets.numberOf0;
        this.auditScoreSets.numberOf25 += categoryScoreSets.numberOf25;
        this.auditScoreSets.numberOf60 += categoryScoreSets.numberOf60;
        this.auditScoreSets.numberOf85 += categoryScoreSets.numberOf85;
        this.auditScoreSets.numberOf100 += categoryScoreSets.numberOf100;
    }
};