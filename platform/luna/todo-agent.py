#!/usr/bin/env python3
"""
General-Purpose TODO Agent

A flexible agent that reads and presents TODO.md files from any project directory.
Can be triggered by various user requests and provides organized task information.

Usage:
    python todo-agent.py [directory]

Example requests this agent handles:
- "give me the TODOs"
- "show me my todos"
- "what are my current tasks"
- "list my pending work"
- "show project status"
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class TaskStatus(Enum):
    """Enumeration for task status types"""
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"
    PENDING = "pending"
    UNKNOWN = "unknown"


@dataclass
class Task:
    """Represents a single task from the TODO file"""
    content: str
    status: TaskStatus
    level: int  # Indentation level
    line_number: int

    def __str__(self) -> str:
        status_icon = {
            TaskStatus.COMPLETED: "✅",
            TaskStatus.IN_PROGRESS: "🚧",
            TaskStatus.PENDING: "📋",
            TaskStatus.UNKNOWN: "❓"
        }

        indent = "  " * (self.level - 1) if self.level > 1 else ""
        return f"{indent}{status_icon[self.status]} {self.content}"


@dataclass
class TodoSection:
    """Represents a section in the TODO file"""
    title: str
    tasks: List[Task]
    line_number: int

    def __str__(self) -> str:
        if not self.tasks:
            return f"\n## {self.title}\n(No tasks)"

        task_list = "\n".join(str(task) for task in self.tasks)
        return f"\n## {self.title}\n{task_list}"


class TodoAgent:
    """
    General-purpose agent for reading and presenting TODO.md files
    """

    def __init__(self, directory: Optional[str] = None):
        """
        Initialize the TODO agent

        Args:
            directory: Optional directory path. If None, uses current working directory.
        """
        self.directory = Path(directory) if directory else Path.cwd()
        self.todo_file = self.directory / "TODO.md"

    def find_todo_files(self) -> List[Path]:
        """
        Find all TODO.md files in the directory and subdirectories

        Returns:
            List of Path objects pointing to TODO.md files
        """
        todo_files = []

        # Check current directory first
        if self.todo_file.exists():
            todo_files.append(self.todo_file)

        # Check for variations (case-insensitive)
        variations = ["todo.md", "TODO.MD", "Todo.md", "ToDo.md"]
        for variation in variations:
            file_path = self.directory / variation
            if file_path.exists() and file_path not in todo_files:
                todo_files.append(file_path)

        return todo_files

    def parse_task_line(self, line: str, line_number: int) -> Optional[Task]:
        """
        Parse a line to extract task information

        Args:
            line: The line to parse
            line_number: Line number in the file

        Returns:
            Task object if line contains a task, None otherwise
        """
        # Remove leading/trailing whitespace but preserve indentation
        stripped_line = line.rstrip()
        if not stripped_line:
            return None

        # Calculate indentation level
        level = (len(line) - len(line.lstrip())) // 2 + 1

        # Check for markdown task patterns
        task_patterns = [
            (r'^\s*-\s*\[x\]\s*(.+)', TaskStatus.COMPLETED),
            (r'^\s*-\s*\[X\]\s*(.+)', TaskStatus.COMPLETED),
            (r'^\s*-\s*\[\s\]\s*(.+)', TaskStatus.PENDING),
            (r'^\s*-\s*\[~\]\s*(.+)', TaskStatus.IN_PROGRESS),
            (r'^\s*-\s*\[o\]\s*(.+)', TaskStatus.IN_PROGRESS),
            (r'^\s*-\s*(.+)', TaskStatus.PENDING),  # Regular bullet point
            (r'^\s*\*\s*(.+)', TaskStatus.PENDING),  # Asterisk bullet
            (r'^\s*\+\s*(.+)', TaskStatus.PENDING),  # Plus bullet
        ]

        for pattern, status in task_patterns:
            match = re.match(pattern, stripped_line)
            if match:
                content = match.group(1).strip()
                return Task(content, status, level, line_number)

        return None

    def parse_section_header(self, line: str, line_number: int) -> Optional[Tuple[str, int]]:
        """
        Parse a line to check if it's a section header

        Args:
            line: The line to parse
            line_number: Line number in the file

        Returns:
            Tuple of (section_title, header_level) if it's a header, None otherwise
        """
        stripped_line = line.strip()

        # Check for markdown headers
        header_match = re.match(r'^(#{1,6})\s*(.+)', stripped_line)
        if header_match:
            level = len(header_match.group(1))
            title = header_match.group(2).strip()
            return title, level

        return None

    def categorize_section(self, title: str) -> TaskStatus:
        """
        Categorize a section based on its title

        Args:
            title: Section title

        Returns:
            TaskStatus representing the section category
        """
        title_lower = title.lower()

        if any(keyword in title_lower for keyword in ['completed', 'done', 'finished', '✅']):
            return TaskStatus.COMPLETED
        elif any(keyword in title_lower for keyword in ['progress', 'working', 'current', '🚧']):
            return TaskStatus.IN_PROGRESS
        elif any(keyword in title_lower for keyword in ['pending', 'todo', 'planned', 'upcoming', '📋']):
            return TaskStatus.PENDING
        else:
            return TaskStatus.UNKNOWN

    def parse_todo_file(self, file_path: Path) -> List[TodoSection]:
        """
        Parse a TODO.md file and extract sections and tasks

        Args:
            file_path: Path to the TODO.md file

        Returns:
            List of TodoSection objects
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
        except (IOError, UnicodeDecodeError) as e:
            print(f"Error reading file {file_path}: {e}")
            return []

        sections = []
        current_section = None
        current_tasks = []

        for line_number, line in enumerate(lines, 1):
            # Check for section header
            section_info = self.parse_section_header(line, line_number)
            if section_info:
                # Save previous section if it exists
                if current_section:
                    sections.append(TodoSection(current_section, current_tasks, line_number))

                # Start new section
                current_section = section_info[0]
                current_tasks = []
                continue

            # Check for task
            task = self.parse_task_line(line, line_number)
            if task:
                current_tasks.append(task)

        # Add the last section
        if current_section:
            sections.append(TodoSection(current_section, current_tasks, len(lines)))

        return sections

    def get_task_summary(self, sections: List[TodoSection]) -> Dict[str, int]:
        """
        Generate a summary of tasks by status

        Args:
            sections: List of TodoSection objects

        Returns:
            Dictionary with task counts by status
        """
        summary = {
            "completed": 0,
            "in_progress": 0,
            "pending": 0,
            "total": 0
        }

        for section in sections:
            for task in section.tasks:
                if task.status == TaskStatus.COMPLETED:
                    summary["completed"] += 1
                elif task.status == TaskStatus.IN_PROGRESS:
                    summary["in_progress"] += 1
                elif task.status == TaskStatus.PENDING:
                    summary["pending"] += 1
                summary["total"] += 1

        return summary

    def format_output(self, sections: List[TodoSection], file_path: Path) -> str:
        """
        Format the parsed TODO information for display

        Args:
            sections: List of TodoSection objects
            file_path: Path to the source file

        Returns:
            Formatted string representation
        """
        if not sections:
            return f"📄 TODO file found at {file_path} but no tasks detected."

        # Generate summary
        summary = self.get_task_summary(sections)

        # Build output
        output = []
        output.append(f"📄 TODO Report from: {file_path}")
        output.append("=" * 60)

        # Summary section
        output.append(f"\n📊 Task Summary:")
        output.append(f"   Total Tasks: {summary['total']}")
        output.append(f"   ✅ Completed: {summary['completed']}")
        output.append(f"   🚧 In Progress: {summary['in_progress']}")
        output.append(f"   📋 Pending: {summary['pending']}")

        if summary['total'] > 0:
            completion_rate = (summary['completed'] / summary['total']) * 100
            output.append(f"   📈 Completion Rate: {completion_rate:.1f}%")

        # Sections
        for section in sections:
            output.append(str(section))

        return "\n".join(output)

    def handle_request(self, user_input: str = "") -> str:
        """
        Main method to handle user requests for TODO information

        Args:
            user_input: User's request (optional, for context)

        Returns:
            Formatted TODO information or error message
        """
        # Find TODO files
        todo_files = self.find_todo_files()

        if not todo_files:
            return (
                f"❌ No TODO.md file found in {self.directory}\n\n"
                "💡 To use this agent, create a TODO.md file with your tasks.\n"
                "   Example format:\n"
                "   # My Project TODO\n"
                "   \n"
                "   ## Completed\n"
                "   - [x] Finished task\n"
                "   \n"
                "   ## In Progress\n"
                "   - [~] Current task\n"
                "   \n"
                "   ## Pending\n"
                "   - [ ] Future task"
            )

        # Process each TODO file
        all_output = []
        for file_path in todo_files:
            sections = self.parse_todo_file(file_path)
            formatted_output = self.format_output(sections, file_path)
            all_output.append(formatted_output)

        return "\n\n" + "=" * 80 + "\n\n".join(all_output)

    def is_todo_request(self, user_input: str) -> bool:
        """
        Check if user input is requesting TODO information

        Args:
            user_input: User's input string

        Returns:
            True if input appears to be a TODO request
        """
        user_input_lower = user_input.lower()

        todo_keywords = [
            "todo", "todos", "to-do", "to-dos",
            "task", "tasks", "current tasks",
            "what do i need to do", "what needs to be done",
            "show me my", "give me the", "list my",
            "project status", "pending work",
            "what's left", "remaining work"
        ]

        return any(keyword in user_input_lower for keyword in todo_keywords)


def main():
    """Main function for command-line usage"""
    import argparse

    parser = argparse.ArgumentParser(
        description="General-purpose TODO agent for reading and presenting TODO.md files"
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=None,
        help="Directory to search for TODO.md files (default: current directory)"
    )
    parser.add_argument(
        "--query",
        default="",
        help="User query/request (for testing request detection)"
    )

    args = parser.parse_args()

    # Create and run agent
    agent = TodoAgent(args.directory)
    result = agent.handle_request(args.query)
    print(result)


if __name__ == "__main__":
    main()