\documentclass{article}
\usepackage{url}
\usepackage{hyperref}
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
}
\usepackage{listings}
\usepackage{xcolor}

\definecolor{codegreen}{rgb}{0,0.6,0}
\definecolor{codegray}{rgb}{0.5,0.5,0.5}
\definecolor{codepurple}{rgb}{0.58,0,0.82}
\definecolor{backcolour}{rgb}{0.95,0.95,0.92}

\lstdefinestyle{mystyle}{
    backgroundcolor=\color{backcolour},   
    commentstyle=\color{codegreen},
    keywordstyle=\color{magenta},
    numberstyle=\tiny\color{codegray},
    stringstyle=\color{codepurple},
    basicstyle=\ttfamily\footnotesize,
    breakatwhitespace=false,         
    breaklines=true,                 
    captionpos=b,                    
    keepspaces=true,                 
    numbers=left,                    
    numbersep=5pt,                  
    showspaces=false,                
    showstringspaces=false,
    showtabs=false,                  
    tabsize=2
}

\lstset{style=mystyle}

\begin{document}

\title{Patholens Project - Running with Docker Compose}
\author{}
\date{}
\maketitle

\section*{Voraussetzungen}
Bevor Sie das Projekt ausführen, stellen Sie sicher, dass Sie Folgendes auf Ihrem System installiert haben:

\begin{itemize}
    \item Docker
    \item Docker Compose
\end{itemize}

\section*{Erste Schritte}
Um das Projekt mit Docker Compose auszuführen, folgen Sie diesen Schritten:

\subsection*{1. Repository klonen}
Falls Sie dies noch nicht getan haben, klonen Sie das Projekt-Repository:

\begin{lstlisting}[language=bash]
git clone https://github.com/YOUR_USERNAME/patholens.git
\end{lstlisting}

\textit{(Ersetzen Sie \texttt{YOUR\_USERNAME} mit dem richtigen Repository-Besitzer.)}

\subsection*{2. Navigieren Sie zum Projektverzeichnis}
Wechseln Sie in das Verzeichnis, in dem sich die \texttt{docker-compose.yml}-Datei befindet:

\begin{lstlisting}[language=bash]
cd patholens/patholensProject
\end{lstlisting}

\subsection*{3. Starten Sie die Anwendung}
Führen Sie den folgenden Befehl aus, um die Anwendung zu erstellen und zu starten:

\begin{lstlisting}[language=bash]
docker compose up --build
\end{lstlisting}

\textit{(Das Flag \texttt{--build} stellt sicher, dass Docker das Image neu erstellt, falls es Änderungen gibt.)}

\subsection*{4. Auf die Anwendung zugreifen}
Sobald die Anwendung läuft, können Sie sie in Ihrem Browser aufrufen:

\begin{itemize}
    \item \textbf{Hauptanwendung:} \\
    \url{http://localhost:8000/}
    
    \item \textbf{Django Admin Panel:} \\
    \url{http://localhost:8000/admin/}
    
    \item \textbf{Medien-Dateien (falls benötigt):} \\
    \url{http://localhost:8000/media/}
\end{itemize}

\subsection*{5. Anwendung stoppen}
Um die Anwendung zu stoppen, drücken Sie \texttt{STRG + C} im Terminal und führen Sie dann den folgenden Befehl aus:

\begin{lstlisting}[language=bash]
docker compose down
\end{lstlisting}

\subsection*{6. Anwendung neu starten}
Um die Anwendung ohne Neuerstellung neu zu starten:

\begin{lstlisting}[language=bash]
docker compose up
\end{lstlisting}

\end{document}