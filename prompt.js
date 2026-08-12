function buildPrompt(texts){

return `
Classify each of the following UI texts.

Return format for each text:
ID | Category

Context:

Definition of Dark Patterns

Dark patterns are deceptive user interface design techniques intentionally created to manipulate users into making decisions they might not otherwise make. These patterns exploit cognitive biases, hide critical information, create artificial pressure, or make certain actions intentionally difficult.
Your task is to classify whether a given text represents a dark pattern and determine which category it belongs to.

Classification of Dark Patterns

The system recognizes the following eight categories of dark patterns:

1. Misdirection
2. Urgency
3. Scarcity
4. Social Proof
5. Obstruction
6. Forced Action
7. Sneaking
8. Fake Discount

If the text does not belong to any of these categories, it should be classified as Not Dark Pattern.

Definition of Category 1 — Misdirection:
Misdirection occurs when a design intentionally draws the user’s attention toward one element to distract them from another important element. This may involve misleading visuals, confusing wording, or emotional manipulation (e.g., guilt or shame) to influence user choices.

Definition of Category 2 — Urgency:
Urgency occurs when users are pressured to act quickly using time-related pressure such as countdown timers, limited-time offers, messages indicating that an offer will expire soon, or highly aggressive promotional banners (e.g. "FLASH SALE", "SALE IS LIVE NOW", "MEGA SALE") that create artificial pressure to buy immediately.

Definition of Category 3 — Scarcity:
Scarcity occurs when users are pressured by suggesting limited availability, such as “Only 2 left in stock”, “Selling fast”, or “High demand”.

Definition of Category 4 — Social Proof:
Social Proof involves showing activity from other users to influence decisions. Examples include messages like “200 people bought this today”, “Trending product”, or testimonials with unclear sources.

Definition of Category 5 — Obstruction:
Obstruction occurs when a system makes certain actions unnecessarily difficult. A common example is making it easy to sign up for a service but difficult to cancel or unsubscribe.

Definition of Category 6 — Forced Action:
Forced Action occurs when users must perform an unwanted action (e.g., creating an account, sharing personal information, or enabling notifications) in order to access content or functionality.

Definition of Category 7 — Sneaking:
Sneaking involves hiding or delaying important information from the user. Examples include hidden fees appearing during checkout, automatically adding items to a cart, or enrolling users in subscriptions without clear consent.

Definition of Category 8 — Fake Discount:
Fake Discount occurs when a crossed-out original price is accompanied by highly suspicious, unbelievable claims (e.g., "99% OFF today only!"), OR when massive generic discounts (e.g. "Flat 50% off your 1st order", "15% off entire menu") are prominently advertised in banners to aggressively bait users. Standard crossed-out prices without aggressive text are common and should not be flagged.

Definition of Category 9 — NORMAL (Not Dark Pattern):
If the given text does not demonstrate any manipulative design strategy described above, or if it is a standard product name, classify it as NORMAL.

---

TRAINING EXAMPLES (Few-Shot Prompting):

Misdirection
- "No, I'll rather pay full price"
- "No thanks, I dont want a discount"

Urgency
- "Items reserved for 15:00"
- "1 day 08:15:25"
- "Limited time deal"
- "FLASH SALE"
- "SALE IS LIVE NOW"
- "MEGA EID SALE"

Scarcity
- "1 LEFT"
- "87% offers claimed. Hurry up!"

Social Proof
- "IN 43 PEOPLE'S SHOPPING BAG"
- "Armin Dinovic bought 10M Runescape 3 Gold Order total: 3,70 C About 10 seconds ago"

Obstruction
- "You may change the items in your order, or cancel the Smartship at anytime, up until 3 days prior to the scheduled ship date of your Smartship by calling Customer Service at 1-800-518-0284"
- "We may also disclose your information to third parties who may contact you with details of other products and services which may be of interest. If you do not want your name and mailing details made available in this way please email opt-out@nextdirect.com"

Forced Action
- "I would like to join Backstage Pass & agree to the Terms & Conditions & to receive emails & other promotional offers"
- "I agree to receive marketing emails from Natural Life and agree to our Privacy Policy and terms of use"

Sneaking
- "Order Subtotal $19.99 Standard Delivery $12.99 Care & Handling $2.99 Tax $2.38 Total $38.35 Savings Today $10.00"
- "Purchase protection added"

Fake Discount
- "Original Price $1,199.00 - Yours for $19.99! (98% OFF) CLAIM NOW!"
- "Was ৳5000, Now ৳50 (99% Savings!)"
- "Flat 50% off your 1st order"
- "15% off entire menu"

NORMAL (Not Dark Pattern)
- "Deals & Discounts"
- "More Buying Choices"
- "Add to cart"
- "May 26 - Jun 2"
- "Product specifications"
- "Mini Electric Massage Gun Portable Deep Tissue"
- "Zepto car shampoo sparkling clean vehicle"
- "Fashion sports led watch, upgraded version"
- "6 mutual friends"
- "John liked this post"
- "3 comments"
- "Keyboard & Mouse"
- "Sort by: Price High to Low"
- "Filter by Brand"
- "451 reviews"
- "1,304 reviews"
- "Getaway Deal"
- "BDT 10,849 BDT 6,509"

---

Processing Instructions:

1. Carefully analyze each text given below.
2. Determine whether it contains manipulative design characteristics.
3. Compare the text with the definitions and training examples of each dark pattern category.
Output Format:
Return EXACTLY one line per input text in the exact format: 
ID | Category: A short 1-sentence explanation of why it is manipulative.

If it is completely normal, not manipulative, or looks like random OCR garbage/fragments, return exactly: 
ID | NORMAL

Example Output:
0 | Urgency: The text uses a countdown timer to create artificial pressure to buy.
1 | NORMAL
2 | Sneaking: The text indicates hidden costs were added without consent.

CRITICAL RULES FOR EXPLANATIONS (MUST FOLLOW EXACTLY):
1. YOU MUST PROCESS EVERY SINGLE INPUT TEXT. Return exactly one line for each ID provided in the input.
2. If a text is NORMAL, YOU MUST OUTPUT EXACTLY "ID | NORMAL". DO NOT output any explanation after the word NORMAL.
   - CORRECT: "1 | NORMAL"
   - INCORRECT: "1 | NORMAL: The text is a product name."
3. For actual dark patterns, keep the explanation extremely short (under 15 words).
4. Evaluate each text COMPLETELY INDEPENDENTLY. 
5. NEVER reference other texts in your explanation (e.g., NEVER say "Similar to text #0").
6. If a text contains random symbols, OCR errors, or incomplete fragments (e.g., "55° |", "c%", "eee"), do NOT hallucinate a dark pattern. Classify it as NORMAL.

The Category MUST be exactly one of the 9 categories listed above.
DO NOT include any extra conversational text.

Texts:
${texts.map((t, i) => `${i} | ${t}`).join("\n")}
`;

}

function buildVisionPrompt() {
return `
Kindly conduct a comprehensive analysis of the given image to identify any deceptive patterns, employing the provided taxonomy. While examining the image, consider the following categories of deceptive patterns:
1. **Nagging**: Spot any repetitive and unexpected pop-up windows that disrupt user activities. 
2. **Roach Motel**: Identify scenarios where opting in is easy, but opting out is complicated or obscure. 
3. **Price Comparison Prevention**: Detect any elements that hinder direct comparisons of prices or plans. 
4. **Intermediate Currency**: Look for instances where virtual currencies are used to obscure real financial costs. 
5. **Forced Continuity**: Examine if users are charged after a trial period ends without clear advance notice. 
6. **Hidden Costs**: Check for the late disclosure of additional costs such as taxes, delivery, or service fees. 
7. **Sneak into Basket**: Identify if items not actively selected by users are automatically added to the shopping cart. 
8. **Hidden Information**: Ensure that essential options or actions are not concealed or difficult to find. 
9. **Preselection**: Look for cases where options are preselected by default, without explicit user consent. 
10. **Toying with Emotion**: Evaluate design elements such as language, colors, or styles that are intended to elicit emotional responses and pressure users into making decisions. 
11. **False Hierarchy**: Observe if any option is made to appear more significant than other equivalent choices. 
12. **Disguised Ads**: Detect if advertisements are designed to resemble normal content. 
13. **Tricked Questions**: Identify any confusing or misleadingly worded questions. 
14. **Small Close Button**: Check if close buttons are too small to be easily located or clicked.
15. **Social Pyramid**: Look for incentives encouraging users to share content with friends for rewards. 
16. **Privacy Zuckering**: Assess if default options necessitate sharing unnecessary personal information. 
17. **Gamification**: Note if users are required to repeatedly perform tasks to earn rewards. 
18. **Countdown on Ads**: Identify if timers restrict users from closing ads immediately. 
19. **Watch Ads to Unlock**: Check if users must watch advertisements to access particular features or rewards. 
20. **Pay to Avoid Ads**: Note if users are charged to remove adverts. 
21. **Forced Enrollment**: Determine if users must sign up or sign in before they can utilize the service.
Additional steps for a thorough review: - **UI Color and Text**: Assess the user interface design elements such as color schemes and text that might manipulate user decisions. Focus particularly on color contrasts and overall readability. - **Information Visibility**: Verify that critical information is easily accessible without reliance on hidden links or convoluted navigation paths. - **User Experience Flow**: Evaluate the user journey to ensure smooth navigation with minimal interruptions. - **Call-to-Action Design**: Examine the visibility and clarity of call-to-action buttons and links compared to dismissive or less prominent options. - **Consistency**: Ensure that design elements and user expectations remain consistent across different pages or sections.

Your detailed review and precise identification of any deceptive patterns in this image are crucial to understand their impact and effectiveness.

Please return your findings in the following strict format (return ONLY the category name if found, or NORMAL if none found):
Category: [Insert Category Name or NORMAL]
Explanation: [A short 1-sentence explanation]
`;
}