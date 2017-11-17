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

        this.calculatorService = calculatorService;
        this.flatQuestions = [];
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
            this.calculateOverall(result);
        }
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
    calculateCategory: function (category) {
        if (!category.label === 'Product Code Info' && category.questions) {
            this.calculateScore(category.score, category.questions);
        }
    },

    /**
     * calculateOverall - calculate the overall audit score.
     * the overall score is a single formula based on all question scores not averages of category scores.
     * @param auditResult - the audit result to calculate.
     */
    calculateOverall: function (auditResult) {
        this.calculateScore(auditResult.score, this.flatQuestions, true);
    },

    /**
     * calculateScore - calculate score based on questions given. this is the main scoring logic.
     * adds each question to the flatQuestions array for use in overall scoring
     * @param score - the score object to change.
     * @param questions - the list of questions to score.
     * @param isOverall - optional parameter so we don't add to flatQuestions this round.
     */
    calculateScore: function (score, questions, isOverall) {
        if (questions) {
            var totalEarnedPoints = 0;
            var scoreSets = {
                numberOfQuestions: 0,
                numberOfPerfects: 0,
                numberOfHighs: 0,
                numberOfLows: 0
            };
            for (var i = 0, len = questions.length; i < len; i++) {
                if (question.excluded) {
                    return;
                }
                var question = questions[i];
                var answer = this.calculatorService.getQuestionResponse(question);
                if (answer && typeof answer.earned === 'number') {
                    totalEarnedPoints += answer.earned;
                    scoreSets.numberOfQuestions += 1;
                    switch (answer.earned) {
                        case 100:
                            scoreSets.numberOfPerfects += 1;
                            break;
                        case 85:
                            scoreSets.numberOfHighs += 1;
                            break;
                        case 60:
                            scoreSets.numberOfLows += 1;
                            break;
                        default:
                    }
                }
            }
            score.earned = totalEarnedPoints + this.getAdditionalPoints(scoreSets);
        }
    },

    /**
     * calculatorService - used to store the provided calculator service from calculate method so it is available in other methods
     */
    calculatorService: null,

    /**
     * flatQuestions - store each question as we loop through duing category scoring so they can be used for the overall score.
     */
    flatQuestions: [],

    /**
     * getAdditionalPoints - get additional points based
     * choice 5 = 100% - no additional points
     * choices 4 or 6 = 85% + number of 5's/number of questions * 10%
     * choices 3 or 7 = 60% + number of 5's/number of questions * 20% + number of 4's and 6's/number of questions * 10%
     * choices 2 or 8 = 25% - no additional points
     * choices 1 or 9 = 0% - no additional points
     */
    getAdditionalPoints: function (scoreSets) {
        if (scoreSets.numberOfQuestions > 1) {
            if (scoreSets.numberOfLows > 0) {
                return ((scoreSets.numberOfPerfects/scoreSets.numberOfQuestions - 1) * .10);
            } else if (scoreSets.numberOfHighs > 0) {
                return ((scoreSets.numberOfPerfects/scoreSets.numberOfQuestions - 1) * .20) + ((scoreSets.numberOfHighs/scoreSets.numberOfQuestions - 1) * .10);
            } else {
                return 0;
            }
        }
        return 0;
    },

    /**
     * isPassing - determine if result is passing based on score percentage of 60%
     * @returns - boolean
     */
    isPassing: function (score) {
        if (score && score.percentage) {
            return score.percentage >= 60;
        }
        return false;
    },

    targetPercentage: 85
};