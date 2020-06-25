using System;
using Microsoft.Jupyter.Core;

namespace Microsoft.Quantum.IQSharp.Jupyter
{
    public class ExecutionPathToHtmlEncoder : IResultEncoder
    {
        private static int count = 0;

        /// <inheritdoc />
        public string MimeType => MimeTypes.Html;

        /// <summary>
        ///     Checks if a given display object is an ExecutionPath object, and if so,
        ///     returns its visualization into an HTML doc.
        /// </summary>
        public EncodedData? Encode(object displayable)
        {
            if (displayable is ExecutionPath path)
            {
                var id = $"container-{count}";
                var script = $@"
                    <div id='{id}' />
                    <script>
                        window.jsonToHtmlEncoder.render({path.ToJson()}, '{id}');
                    </script>
                ";
                count++;

                return script.ToEncodedData();
            }
            else return null;
        }
    }
}