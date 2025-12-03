from typing import List
from models import AutocompleteRequest, AutocompleteResponse

class AutocompleteService:
    
    def __init__(self):
        self.python_keywords = [
            "def", "class", "if", "elif", "else", "for", "while", "try", "except", 
            "finally", "with", "import", "from", "return", "yield", "lambda"
        ]
        
        self.common_methods = [
            "append()", "extend()", "insert()", "remove()", "pop()", "clear()",
            "index()", "count()", "sort()", "reverse()", "copy()",
            "split()", "join()", "replace()", "strip()", "lower()", "upper()",
            "startswith()", "endswith()", "find()", "format()"
        ]
        
        self.common_modules = [
            "os", "sys", "json", "requests", "datetime", "time", "random",
            "math", "re", "collections", "itertools", "functools"
        ]
        
        self.builtin_functions = [
            "print()", "len()", "str()", "int()", "float()", "bool()", "list()",
            "dict()", "tuple()", "set()", "range()", "enumerate()", "zip()",
            "map()", "filter()", "sorted()", "reversed()", "sum()", "min()", "max()"
        ]
    
    def get_suggestions(self, request: AutocompleteRequest) -> AutocompleteResponse:
        code = request.code
        cursor_position = request.cursor_position
        language = request.language.lower()
        
        # Get current line up to cursor
        text_before_cursor = code[:cursor_position]
        current_line = text_before_cursor.split('\n')[-1]
        
        if language == "python":
            suggestions = self._analyze_python_context(current_line, text_before_cursor)
        elif language == "javascript" or language == "typescript":
            suggestions = self._analyze_js_context(current_line, text_before_cursor)
        else:
            suggestions = self._analyze_generic_context(current_line, text_before_cursor)
        
        # Return top 3 suggestions
        return AutocompleteResponse(suggestions=suggestions[:3])
    
    def _analyze_python_context(self, current_line: str, text_before_cursor: str) -> List[str]:
        suggestions = []
        line_stripped = current_line.strip()
        
        # Function definition completion
        if "def " in current_line and "(" in current_line and "):" not in current_line:
            suggestions.append("):")
        
        # Control structure completion
        elif any(keyword in current_line for keyword in ["if ", "elif ", "for ", "while ", "try:", "except:", "with "]) and ":" not in current_line:
            suggestions.append(":")
        
        # Class definition completion
        elif "class " in current_line and ":" not in current_line:
            suggestions.append(":")
        
        # Method chaining (object.method)
        elif line_stripped.endswith("."):
            suggestions.extend(self.common_methods)
        
        # Import statement completion
        elif "import " in current_line or "from " in current_line:
            suggestions.extend(self.common_modules)
        
        # Function call patterns
        elif line_stripped.endswith("("):
            if "print(" in current_line:
                suggestions.extend(['"Hello, World!"', 'f"Value: {variable}"', 'variable'])
            elif "len(" in current_line:
                suggestions.extend(['list_name', 'string_name', 'dict_name'])
        
        # Default suggestions for general context
        else:
            # Add builtin functions
            suggestions.extend(self.builtin_functions)
            
            # Add keywords based on context
            if self._is_in_function_or_class(text_before_cursor):
                suggestions.extend(["return ", "yield ", "raise "])
            
            # Add common patterns
            suggestions.extend([
                'if __name__ == "__main__":',
                "try:",
                "except Exception as e:",
                "with open() as f:",
            ])
        
        return list(dict.fromkeys(suggestions))  # Remove duplicates while preserving order
    
    def _analyze_js_context(self, current_line: str, text_before_cursor: str) -> List[str]:
        """Analyze JavaScript/TypeScript context and return relevant suggestions."""
        suggestions = []
        line_stripped = current_line.strip()
        
        # Function definition completion
        if "function " in current_line and "(" in current_line and "){" not in current_line:
            suggestions.append(") {")
        
        # Arrow function completion
        elif "=>" not in current_line and "=" in current_line:
            suggestions.append("=> {")
        
        # Control structure completion
        elif any(keyword in current_line for keyword in ["if ", "for ", "while ", "switch "]) and "{" not in current_line:
            suggestions.append(" {")
        
        # Method chaining
        elif line_stripped.endswith("."):
            suggestions.extend(["map()", "filter()", "reduce()", "forEach()", "find()", "includes()"])
        
        # Import/require statements
        elif "import " in current_line or "require(" in current_line:
            suggestions.extend(["react", "lodash", "axios", "express", "fs"])
        
        # Console methods
        elif "console." in current_line:
            suggestions.extend(["log()", "error()", "warn()", "info()"])
        
        # Default suggestions
        else:
            suggestions.extend([
                "console.log()",
                "const ",
                "let ",
                "function ",
                "if (",
                "for (",
                "return ",
                "async ",
                "await ",
                "try {",
                "catch (error) {"
            ])
        
        return list(dict.fromkeys(suggestions))
    
    def _analyze_generic_context(self, current_line: str, text_before_cursor: str) -> List[str]:
        suggestions = []
        line_stripped = current_line.strip()
        
        # Basic programming constructs
        if line_stripped.endswith("."):
            suggestions.extend(["length", "size", "count"])
        elif "if" in current_line and "(" not in current_line:
            suggestions.append("(")
        elif "for" in current_line and "(" not in current_line:
            suggestions.append("(")
        else:
            suggestions.extend(["if", "for", "while", "function", "return"])
        
        return list(dict.fromkeys(suggestions))
    
    def _is_in_function_or_class(self, text: str) -> bool:
        lines = text.split('\n')
        for line in reversed(lines):
            stripped = line.strip()
            if stripped.startswith('def ') or stripped.startswith('class '):
                return True
            elif stripped and not line.startswith(' ') and not line.startswith('\t'):
                break
        return False

# Global autocomplete service instance
autocomplete_service = AutocompleteService()