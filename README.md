# DealBot AI - Amazon Price Negotiation Assistant

An intelligent chatbot powered by AWS Bedrock (Claude 3.5 Sonnet) that helps customers negotiate better prices on Amazon products through natural conversation.

## 🌟 Features

- **AI-Powered Negotiations**: Uses Claude 3.5 Sonnet for natural, conversational price negotiations
- **Knowledge Base Integration**: Retrieves negotiation rules and strategies from AWS Bedrock Knowledge Base
- **Smart Tool Calling**: Automatically accesses historical pricing data and performs comparisons
- **Real-time Chat Widget**: Embeddable JavaScript widget with Amazon-themed UI
- **Rate Limiting**: Built-in throttling to handle AWS API limits gracefully
- **Session Management**: Maintains conversation context across multiple messages

## 📋 Prerequisites

- Python 3.8+
- AWS Account with Bedrock access
- AWS Bedrock Knowledge Base (optional but recommended)
- AWS credentials configured

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd dealbot-ai
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your AWS Knowledge Base ID:

```env
# AWS Bedrock Configuration
AWS_REGION=us-east-1

# AWS Bedrock Knowledge Base
KNOWLEDGE_BASE_ID=your-actual-knowledge-base-id
KB_DISTANCE_THRESHOLD=0.3
KB_TOP_K=5
```

**⚠️ IMPORTANT**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### 4. Configure AWS Credentials

Ensure your AWS credentials are set up using one of these methods:

- **AWS CLI**: Run `aws configure`
- **Environment Variables**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- **Credentials File**: Create `~/.aws/credentials`

### 5. Run the Application

```bash
python app.py
```

The API will start on `http://localhost:5000`

### 6. Open the Demo

Open `demo.html` in your web browser and click "Negotiate Price" to start chatting!

## 📁 Project Structure

```
dealbot-ai/
├── app.py                          # Main Flask API server
├── dealbot-widget.js               # Chat widget (embeddable)
├── demo.html                       # Demo page with product
├── .env                            # Environment configuration
├── requirements.txt                # Python dependencies
├── README.md                       # This file
└── Amazon-demo/                    # Configurable widget demo
    ├── Amazon.html
    └── chatbot-widget-configurable.js
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `KNOWLEDGE_BASE_ID` | Bedrock Knowledge Base ID | Required |
| `KB_DISTANCE_THRESHOLD` | Similarity threshold (0.0-1.0) | `0.3` |
| `KB_TOP_K` | Number of KB results to retrieve | `5` |

### Model Configuration

The application uses **Claude 3.5 Sonnet v2** by default. To change the model, edit `MODEL_ID` in `app.py`:

```python
MODEL_ID = "us.anthropic.claude-3-5-haiku-20241022-v1:0"  # For faster/cheaper responses
```

### Rate Limiting

Current settings (adjustable in `app.py`):
- **Request interval**: 10 seconds between requests
- **Retry delay**: 20 seconds when throttled
- **Max retries**: 5 attempts

## 🛠️ API Endpoints

### POST `/chat`

Send a message to the chatbot.

**Request:**
```json
{
  "message": "I want to negotiate the price",
  "session_id": "session-123"
}
```

**Response:**
```json
{
  "response": "I'd be happy to help you negotiate...",
  "session_id": "session-123"
}
```

### GET `/health`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model": "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
}
```

### DELETE `/sessions/<session_id>`

Clear a conversation session.

## 🎨 Widget Integration

### Basic Integration

Add to any HTML page:

```html
<!-- Load the widget -->
<script src="dealbot-widget.js"></script>

<!-- Add a button to open chat -->
<button onclick="openDealBot()">Chat with DealBot</button>
```

### Widget Functions

```javascript
// Open the chat widget
window.openDealBot();

// Close the chat widget
window.closeDealBot();

// Toggle the chat widget
window.toggleDealBot();
```

## 🔍 How It Works

1. **User Interaction**: Customer opens chat widget and expresses interest in negotiating
2. **Knowledge Base Query**: System retrieves relevant negotiation rules
3. **Tool Invocation**: Claude calls `get_historical_prices()` to fetch pricing data
4. **Negotiation Logic**: AI uses internal data to negotiate within acceptable bounds
5. **Natural Response**: Customer receives friendly, conversational responses
6. **Iterative Process**: Conversation continues until deal is reached or declined

## 🧰 Local Tools

### get_historical_prices(product)

Retrieves historical pricing data for a product.

**Returns:**
- `current_price`: Current market price
- `maximum_acceptable_price`: Lowest acceptable negotiated price
- `margin`: Profit margin
- `price_history`: Last 3 months of pricing data

### compare_numbers(number1, number2, operation)

Performs numeric comparisons for price validation.

**Operations:** `greater`, `greater_or_equal`, `less`, `less_or_equal`, `equal`, `not_equal`

## 🚨 Troubleshooting

### AWS Throttling Errors

If you encounter `ThrottlingException`:

1. **Increase wait times** in `app.py`
2. **Switch to Haiku model** (faster, cheaper)
3. **Request quota increase** from AWS Service Quotas console

### Knowledge Base Not Working

1. Verify `KNOWLEDGE_BASE_ID` is correct
2. Check AWS region matches your KB region
3. Ensure IAM permissions include `bedrock:Retrieve`

### Widget Not Loading

1. Check browser console for errors
2. Verify API is running on `http://localhost:5000`
3. Ensure CORS is enabled (already configured)

## 📊 Performance

- **Response Time**: 2-5 seconds (depends on AWS region and model)
- **Rate Limit**: 10 seconds between requests (configurable)
- **Max Iterations**: 5 tool-calling loops per conversation

## 🔐 Security Notes

- Never commit `.env` file to version control
- Rotate AWS credentials regularly
- Use IAM roles with minimal required permissions
- Implement authentication for production use

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using AWS Bedrock and Claude 3.5 Sonnet**
