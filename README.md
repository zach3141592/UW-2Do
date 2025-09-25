# UW Due Date 

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd UW-DueDate
```

2. Install dependencies:

```bash
npm install
```

3. Set up your OpenAI API key:
   - Copy the example environment file:

```bash
cp .env.example .env
```

- Edit `.env` and add your actual API key:

```bash
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

The app will open automatically in your browser at `http://localhost:3000`.

## Usage

1. **Upload Syllabus**: Drag and drop or click to upload a course syllabus (PDF, Word, or text file)
2. **Analyze**: Click "Analyze Syllabus" to extract due dates using AI
3. **View Results**: See urgent tasks (next 7 days) highlighted at the top
4. **Track Progress**: All upcoming assignments are organized by due date

## Project Structure

```
UW-DueDate/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # Main application logic
├── config.js           # Configuration and API settings
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite development server config
└── .gitignore          # Git ignore rules
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **AI**: OpenAI GPT-4 API
- **Design**: Modern glassmorphism UI with CSS Grid/Flexbox

## Configuration

The app can be configured through `config.js`:

- `URGENT_DAYS_THRESHOLD`: Number of days to consider as "urgent" (default: 7)
- `MAX_FILE_SIZE`: Maximum file size for uploads (default: 10MB)
- `ALLOWED_FILE_TYPES`: Supported file formats

## Security Notes

- API keys should be stored in environment variables (`.env` file)
- Never commit API keys to version control
- The `.env` file is automatically ignored by git

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your academic needs!

## Support

For University of Waterloo students having issues:

- Check that your OpenAI API key is valid and has credits
- Ensure your syllabus has clear due dates
- Try uploading text files if PDFs aren't parsing correctly

---

Built with ❤️ for University of Waterloo students to stay organized and succeed academically!
